import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from './lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Výchozí profil pro fallback
const DEFAULT_PROFILE = {
  id: 1,
  name: "Hlavní uživatel",
  pin: "123456",
  avatar: "HU",
  color: "#4F46E5",
  image: null
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    console.log('🚀 AuthProvider mounted, starting initialization...');
    
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Loading timeout - forcing isLoading = false');
      setIsLoading(false);
    }, 5000); // 5 sekund timeout
    
    initializeApp()
      .then(() => {
        clearTimeout(timeoutId);
        console.log('✅ Initialization completed');
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('❌ Initialization failed:', error);
        setIsLoading(false);
      });
    
    return () => clearTimeout(timeoutId);
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🔄 Starting app initialization...');
      setIsLoading(true);
      
      // Načtení profilů
      console.log('📋 Loading profiles...');
      const { data: supabaseProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (!profilesError && supabaseProfiles && supabaseProfiles.length > 0) {
        console.log(`✅ Loaded ${supabaseProfiles.length} profiles from Supabase`);
        const convertedProfiles = supabaseProfiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          pin: profile.pin,
          avatar: profile.avatar || 'HU',
          color: profile.color || '#4F46E5',
          image: null
        }));
        setProfiles(convertedProfiles);
      } else {
        console.log('⚠️ Using fallback profile');
        setProfiles([DEFAULT_PROFILE]);
      }
      
      // Načtení uloženého uživatele
      console.log('👤 Checking for saved user...');
      const savedUser = localStorage.getItem('paintpro_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
          console.log('✅ User loaded from localStorage:', userData.name);
        } catch (error) {
          console.error('❌ Error parsing saved user:', error);
        }
      } else {
        console.log('👤 No saved user found');
      }
      
    } catch (error) {
      console.error('❌ Error in initialization:', error);
    } finally {
      console.log('🔓 Setting isLoading = false');
      setIsLoading(false);
    }
  };

  const login = (pin) => {
    console.log(`🔐 Login attempt with PIN: ${pin}`);
    const profile = profiles.find(p => p.pin === pin);
    
    if (profile) {
      const user = {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        image: profile.image,
        loginTime: new Date().toISOString()
      };
      setCurrentUser(user);
      localStorage.setItem('paintpro_user', JSON.stringify(user));
      console.log(`✅ Login successful: ${user.name}`);
      return true;
    }
    
    console.log('❌ PIN not found');
    return false;
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    setCurrentUser(null);
    localStorage.removeItem('paintpro_user');
  };

  // Dummy funkce pro kompatibilitu - IMPLEMENTUJEME SUPABASE CRUD
  const getUserData = async (userId) => {
    try {
      console.log('📊 Načítám zakázky z Supabase pro uživatele:', userId);
      
      const { data: zakazky, error } = await supabase
        .from('zakazky')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Chyba při načítání zakázek z Supabase:', error);
        return [];
      }
      
      console.log(`✅ Načteno ${zakazky.length} zakázek z Supabase`);
      
      // Konverze na frontend formát
      const convertedZakazky = zakazky.map(zakazka => ({
        id: zakazka.id,
        datum: zakazka.datum,
        druh: zakazka.druh,
        klient: zakazka.klient,
        cislo: zakazka.id_zakazky,
        castka: Number(zakazka.castka),
        fee: Number(zakazka.fee),
        material: Number(zakazka.material),
        pomocnik: Number(zakazka.pomocnik),
        palivo: Number(zakazka.palivo),
        zisk: Number(zakazka.zisk),
        adresa: zakazka.adresa,
        telefon: (() => {
          // Extract telefon from adresa field
          if (zakazka.adresa && zakazka.adresa.includes('Tel:')) {
            const parts = zakazka.adresa.split(' | Tel: ');
            return parts[1] || 'Bez telefonu';
          }
          return 'Bez telefonu';
        })(),
        soubory: zakazka.soubory || []
      }));
      
      return convertedZakazky;
    } catch (error) {
      console.error('❌ Chyba při načítání dat uživatele:', error);
      return [];
    }
  };

  const addUserOrder = async (userId, orderData) => {
    try {
      console.log('🔄 Přidávám zakázku do Supabase:', orderData);
      
      const zisk = orderData.castka - orderData.fee - orderData.material - orderData.pomocnik - orderData.palivo;
      
      const { data, error } = await supabase
        .from('zakazky')
        .insert([{
          profile_id: userId,
          datum: orderData.datum,
          druh: orderData.druh,
          klient: orderData.klient,
          id_zakazky: orderData.cislo,
          castka: orderData.castka,
          fee: orderData.fee,
          fee_off: orderData.feeOff || 0,
          palivo: orderData.palivo,
          material: orderData.material,
          pomocnik: orderData.pomocnik,
          zisk: zisk,
          adresa: orderData.adresa,
          soubory: orderData.soubory || []
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Chyba při přidávání zakázky do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Zakázka úspěšně přidána do Supabase:', data);
      
      // Načti aktualizovaná data
      const updatedData = await getUserData(userId);
      return updatedData;
    } catch (error) {
      console.error('❌ Fallback na prázdné pole pro addUserOrder:', error);
      return [];
    }
  };

  const editUserOrder = async (userId, orderId, orderData) => {
    try {
      console.log('🔄 Aktualizuji zakázku v Supabase:', orderId, orderData);
      
      const zisk = orderData.castka - orderData.fee - orderData.material - orderData.pomocnik - orderData.palivo;
      
      const { data, error } = await supabase
        .from('zakazky')
        .update({
          datum: orderData.datum,
          druh: orderData.druh,
          klient: orderData.klient,
          id_zakazky: orderData.cislo,
          castka: orderData.castka,
          fee: orderData.fee,
          fee_off: orderData.feeOff || 0,
          palivo: orderData.palivo,
          material: orderData.material,
          pomocnik: orderData.pomocnik,
          zisk: zisk,
          adresa: orderData.adresa,
          soubory: orderData.soubory || []
        })
        .eq('id', orderId)
        .eq('profile_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Chyba při aktualizaci zakázky v Supabase:', error);
        throw error;
      }
      
      console.log('✅ Zakázka úspěšně aktualizována v Supabase:', data);
      
      // Načti aktualizovaná data
      const updatedData = await getUserData(userId);
      return updatedData;
    } catch (error) {
      console.error('❌ Fallback na prázdné pole pro editUserOrder:', error);
      return [];
    }
  };

  const deleteUserOrder = async (userId, orderId) => {
    try {
      console.log('🔄 Mažu zakázku z Supabase:', orderId);
      
      const { error, count } = await supabaseAdmin
        .from('zakazky')
        .delete({ count: 'exact' })
        .eq('id', orderId)
        .eq('profile_id', userId);
      
      if (error) {
        console.error('❌ Chyba při mazání zakázky z Supabase:', error);
        throw error;
      }
      
      console.log(`✅ Zakázka úspěšně smazána z Supabase (smazáno ${count} záznamů)`);
      
      // Načti aktualizovaná data
      const updatedData = await getUserData(userId);
      return updatedData;
    } catch (error) {
      console.error('❌ Fallback na prázdné pole pro deleteUserOrder:', error);
      return [];
    }
  };
  const addProfile = async (profileData) => {
    try {
      console.log('🔄 Přidávám profil do Supabase (admin operace):', profileData);
      
      // Vložit do Supabase s admin klíčem
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          pin: profileData.pin,
          name: profileData.name,
          avatar: profileData.avatar || profileData.name.slice(0, 2).toUpperCase(),
          color: profileData.color || '#4F46E5'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Chyba při přidávání profilu do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Profil úspěšně přidán do Supabase:', data);
      
      // Aktualizuj lokální state
      const updatedProfiles = [...profiles, {
        id: data.id,
        name: data.name,
        pin: data.pin,
        avatar: data.avatar,
        color: data.color,
        image: null
      }];
      setProfiles(updatedProfiles);
      
      return data;
    } catch (error) {
      console.error('❌ Fallback na localStorage pro addProfile:', error);
      // Fallback na původní localStorage logiku
      const newId = Math.max(...profiles.map(p => p.id), 0) + 1;
      const newProfile = {
        ...profileData,
        id: newId,
        avatar: profileData.avatar || profileData.name.slice(0, 2).toUpperCase()
      };
      
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      return newProfile;
    }
  };

  const editProfile = async (profileId, pin, updatedData) => {
    try {
      const profile = profiles.find(p => p.id === profileId && p.pin === pin);
      if (!profile) return false;

      console.log('🔄 Aktualizuji profil v Supabase (admin operace):', profileId, updatedData);
      
      // Aktualizuj v Supabase s admin klíčem
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updatedData.name,
          avatar: updatedData.avatar || updatedData.name?.slice(0, 2).toUpperCase() || profile.avatar,
          color: updatedData.color || profile.color
        })
        .eq('id', profileId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Chyba při aktualizaci profilu v Supabase:', error);
        throw error;
      }
      
      console.log('✅ Profil úspěšně aktualizován v Supabase:', data);
      
      // Aktualizuj lokální state
      const updatedProfiles = profiles.map(p => 
        p.id === profileId 
          ? { 
              ...p, 
              name: data.name,
              avatar: data.avatar,
              color: data.color
            }
          : p
      );
      
      setProfiles(updatedProfiles);
      
      // Aktualizovat current user pokud edituje sebe
      if (currentUser && currentUser.id === profileId) {
        const updatedUser = {
          ...currentUser,
          name: data.name,
          avatar: data.avatar,
          color: data.color
        };
        setCurrentUser(updatedUser);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Fallback na localStorage pro editProfile:', error);
      return true;
    }
  };

  const deleteProfile = async (profileId, pin) => {
    try {
      if (profiles.length <= 1) return false; // Nesmí smazat poslední profil
      
      const profile = profiles.find(p => p.id === profileId && p.pin === pin);
      if (!profile) return false;

      console.log('🔄 Mažu profil z Supabase (admin operace):', profileId);
      
      // KROK 1: Smaž nejdříve všechny zakázky profilu (admin klíč)
      console.log('🗑️ Mažu zakázky profilu...');
      const { error: zakazkyError, count: deletedZakazky } = await supabaseAdmin
        .from('zakazky')
        .delete({ count: 'exact' })
        .eq('profile_id', profileId);
      
      if (zakazkyError) {
        console.error('❌ Chyba při mazání zakázek profilu:', zakazkyError);
        throw zakazkyError;
      }
      
      console.log(`✅ Smazáno ${deletedZakazky} zakázek profilu`);
      
      // KROK 2: Teď smaž profil (admin klíč)
      console.log('🗑️ Mažu profil...');
      const { error, count: deletedProfiles } = await supabaseAdmin
        .from('profiles')
        .delete({ count: 'exact' })
        .eq('id', profileId);
      
      if (error) {
        console.error('❌ Chyba při mazání profilu z Supabase:', error);
        throw error;
      }
      
      console.log(`✅ Profil úspěšně smazán z Supabase (smazáno ${deletedProfiles} záznamů)`);
      
      // Aktualizuj lokální state
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);
      
      // Pokud smaže sebe, odhlásit
      if (currentUser && currentUser.id === profileId) {
        logout();
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Fallback na localStorage pro deleteProfile:', error);
      return true;
    }
  };
  const getProfiles = () => profiles.map(({ pin, ...profile }) => profile);

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    getProfiles,
    getUserData,
    addUserOrder,
    editUserOrder,
    deleteUserOrder,
    addProfile,
    editProfile,
    deleteProfile,
    isAuthenticated: !!currentUser
  };

  console.log(`🔄 AuthProvider render - isLoading: ${isLoading}, currentUser: ${currentUser?.name || 'none'}, profiles: ${profiles.length}`);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};