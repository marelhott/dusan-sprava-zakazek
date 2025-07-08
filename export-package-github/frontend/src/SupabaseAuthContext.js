import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './lib/supabase';

const SupabaseAuthContext = createContext();

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth musí být použit v SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zakazkyData, setZakazkyData] = useState([]);
  const [profiles, setProfiles] = useState([]);

  // Inicializace
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Inicializace Supabase aplikace...');
      
      // Načti profily z Supabase
      await loadProfiles();
      
      // Zkus načíst uloženého uživatele
      const savedUser = localStorage.getItem('paintpro_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        await loadUserData(user);
      }
    } catch (error) {
      console.error('❌ Chyba při inicializaci Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      console.log('✅ Profily načteny z Supabase:', data);
      setProfiles(data || []);
    } catch (error) {
      console.error('❌ Chyba při načítání profilů:', error);
      // Fallback na výchozí profil
      setProfiles([{
        id: 'fallback',
        pin: '123456',
        name: 'Hlavní uživatel',
        avatar: 'HU',
        color: '#4F46E5'
      }]);
    }
  };

  const login = async (pin) => {
    try {
      console.log('🔐 Supabase login pokus s PIN:', pin);
      console.log('📋 Dostupné profily:', profiles);
      
      // Najdi profil podle PIN
      const profile = profiles.find(p => p.pin === pin);
      console.log('👤 Nalezený profil:', profile);
      
      if (!profile) {
        throw new Error('Neplatný PIN');
      }

      await loadUserData(profile);
      
      // Ulož do localStorage
      localStorage.setItem('paintpro_user', JSON.stringify(profile));
      
      console.log('✅ Supabase přihlášení úspěšné');
      return true;
    } catch (error) {
      console.error('❌ Chyba při Supabase přihlášení:', error);
      throw error;
    }
  };

  const loadUserData = async (user) => {
    try {
      setCurrentUser(user);
      
      // Načti zakázky uživatele z Supabase
      const { data, error } = await supabase
        .from('zakazky')
        .select('*')
        .eq('profile_id', user.id);
      
      if (error) throw error;
      
      console.log('✅ Zakázky načteny z Supabase:', data);
      setZakazkyData(data || []);
    } catch (error) {
      console.error('❌ Chyba při načítání dat uživatele:', error);
      // Fallback na prázdná data
      setZakazkyData([]);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setZakazkyData([]);
    localStorage.removeItem('paintpro_user');
  };

  const addZakazka = async (zakazkaData) => {
    try {
      const newZakazka = {
        ...zakazkaData,
        profile_id: currentUser.id
      };
      
      const { data, error } = await supabase
        .from('zakazky')
        .insert([newZakazka])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Zakázka přidána do Supabase:', data);
      setZakazkyData(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('❌ Chyba při přidávání zakázky:', error);
      throw error;
    }
  };

  const updateZakazka = async (zakazkaId, zakazkaData) => {
    try {
      const { data, error } = await supabase
        .from('zakazky')
        .update(zakazkaData)
        .eq('id', zakazkaId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Zakázka aktualizována v Supabase:', data);
      setZakazkyData(prev => prev.map(z => z.id === zakazkaId ? data : z));
      return true;
    } catch (error) {
      console.error('❌ Chyba při aktualizaci zakázky:', error);
      throw error;
    }
  };

  const deleteZakazka = async (zakazkaId) => {
    try {
      const { error } = await supabase
        .from('zakazky')
        .delete()
        .eq('id', zakazkaId);
      
      if (error) throw error;
      
      console.log('✅ Zakázka smazána z Supabase');
      setZakazkyData(prev => prev.filter(z => z.id !== zakazkaId));
      return true;
    } catch (error) {
      console.error('❌ Chyba při mazání zakázky:', error);
      throw error;
    }
  };

  // Kompatibilní metody s původním AuthContext
  const getProfiles = () => profiles;
  
  const addProfile = async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (error) throw error;
      
      setProfiles(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('❌ Chyba při přidávání profilu:', error);
      throw error;
    }
  };

  const editProfile = async (profileId, profileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profileId)
        .select()
        .single();
      
      if (error) throw error;
      
      setProfiles(prev => prev.map(p => p.id === profileId ? data : p));
      return true;
    } catch (error) {
      console.error('❌ Chyba při úpravě profilu:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    zakazkyData,
    profiles,
    isLoading,
    login,
    logout,
    addZakazka,
    updateZakazka,
    deleteZakazka,
    getProfiles,
    addProfile,
    editProfile,
    isAuthenticated: !!currentUser
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthProvider;