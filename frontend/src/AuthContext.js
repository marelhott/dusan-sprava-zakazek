import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from './supabaseClient';

// Výchozí první profil
const DEFAULT_PROFILE = {
  id: 1,
  name: "Hlavní uživatel",
  pin: "123456",
  avatar: "HU",
  color: "#4F46E5",
  image: null
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);

  // Načtení profilů při spuštění
  useEffect(() => {
    initializeApp();
  }, []);

  // Test funkce pro Supabase - správně umístěné v komponentě
  useEffect(() => {
    window.testSupabaseSelect = async () => {
      try {
        console.log('🧪 TESTOVÁNÍ SUPABASE SELECT...');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          console.error('❌ Test SELECT selhal:', error);
          return null;
        }
        
        console.log('✅ Test SELECT úspěšný - počet záznamů:', data.length);
        console.log('📋 Všechny profily:', data);
        
        return data;
      } catch (error) {
        console.error('❌ Test SELECT error:', error);
        return null;
      }
    };

    window.testSupabaseInsert = async () => {
      try {
        console.log('🧪 TESTOVÁNÍ SUPABASE INSERT...');
        
        const testProfile = {
          pin: `test_${Date.now()}`,
          name: 'Test Profile', 
          avatar: 'TP',
          color: '#FF0000'
        };
        
        const { data, error } = await supabase
          .from('profiles')
          .insert([testProfile])
          .select()
          .single();
        
        if (error) {
          console.error('❌ Test INSERT selhal:', error);
          return false;
        }
        
        console.log('✅ Test INSERT úspěšný:', data);
        
        // Vymaž test záznam
        await supabase.from('profiles').delete().eq('id', data.id);
        console.log('✅ Test záznam vymazán');
        
        return true;
      } catch (error) {
        console.error('❌ Test INSERT error:', error);
        return false;
      }
    };
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Inicializace aplikace...');
      
      // Zkus načíst profily z Supabase, pokud ne, použij localStorage
      await loadProfiles();
      
      // Zkus načíst uloženého uživatele z localStorage
      const savedUser = localStorage.getItem('paintpro_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
          console.log('✅ Uživatel načten z localStorage:', userData);
        } catch (error) {
          console.error('Chyba při načítání uživatele:', error);
        }
      }
    } catch (error) {
      console.error('❌ Chyba při inicializaci:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      // Zkus načíst z Supabase
      console.log('🔄 Pokus o načtení profilů z Supabase...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (!error && data && data.length > 0) {
        console.log('✅ Profily načteny z Supabase:', data);
        // Konvertuj Supabase formát na localStorage formát pro kompatibilitu
        const convertedProfiles = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          pin: profile.pin,
          avatar: profile.avatar || 'HU',
          color: profile.color || '#4F46E5',
          image: null
        }));
        setProfiles(convertedProfiles);
        return;
      }
    } catch (supabaseError) {
      console.log('⚠️ Supabase nedostupný, použiji localStorage:', supabaseError.message);
    }

    // Fallback na localStorage
    console.log('🔄 Načítám profily z localStorage...');
    const savedProfiles = localStorage.getItem('paintpro_profiles');
    
    if (savedProfiles) {
      try {
        const profilesData = JSON.parse(savedProfiles);
        setProfiles(profilesData);
        console.log('✅ Profily načteny z localStorage:', profilesData);
      } catch (error) {
        console.error('Chyba při načítání profilů z localStorage:', error);
        setProfiles([DEFAULT_PROFILE]);
        localStorage.setItem('paintpro_profiles', JSON.stringify([DEFAULT_PROFILE]));
      }
    } else {
      // První spuštění - vytvoř výchozí profil
      setProfiles([DEFAULT_PROFILE]);
      localStorage.setItem('paintpro_profiles', JSON.stringify([DEFAULT_PROFILE]));
      console.log('✅ Vytvořen výchozí profil');
    }
  };

  // TEST FUNKCE pro ověření Supabase připojení
  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 TESTOVÁNÍ SUPABASE PŘIPOJENÍ...');
      
      // Test 1: Základní připojení
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' });
      
      if (testError) {
        console.log('❌ Supabase test selhał:', testError.message);
        return false;
      }
      
      console.log('✅ Supabase připojení OK - počet profilů:', testData);
      
      // Test 2: Zkus načíst všechny profily
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.log('❌ Chyba při načítání profilů:', profilesError.message);
        return false;
      }
      
      console.log('✅ Všechny profily z Supabase:', allProfiles);
      
      // Test 3: Zkus základní zápis (test profil)
      const testProfile = {
        pin: `test_${Date.now()}`,
        name: 'Test profil',
        avatar: 'T',
        color: '#FF0000'
      };
      
      const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([testProfile])
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Chyba při zápisu test profilu:', insertError.message);
        return false;
      }
      
      console.log('✅ Test profil vytvořen:', insertedProfile);
      
      // Vymaž test profil
      await supabase
        .from('profiles')
        .delete()
        .eq('id', insertedProfile.id);
      
      console.log('✅ Test profil smazán');
      console.log('🎉 SUPABASE PLNĚ FUNKČNÍ!');
      
      return true;
      
    } catch (error) {
      console.log('❌ Supabase test celkově selhal:', error.message);
      return false;
    }
  };


  // Přihlášení uživatele - opraveno pro PIN-only login
  const login = (pin) => {
    console.log('🔐 Pokus o přihlášení s PIN:', pin);
    console.log('📋 Dostupné profily:', profiles);
    
    // Najdi profil pouze podle PIN (ne podle ID)
    const profile = profiles.find(p => p.pin === pin);
    console.log('👤 Nalezený profil:', profile);
    
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
      console.log('✅ Přihlášení úspěšné:', user);
      return true;
    }
    
    console.log('❌ PIN nenalezen');
    return false;
  };

  // Získání dat uživatele - OPRAVENO pro Supabase
  const getUserData = async (userId) => {
    try {
      console.log('🔄 Načítám zakázky z Supabase pro uživatele:', userId);
      
      // Načti z Supabase
      const { data, error } = await supabase
        .from('zakazky')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        console.log('✅ Zakázky načteny z Supabase:', data.length, 'záznamů');
        // Konvertuj Supabase formát na localStorage formát pro kompatibilitu
        const convertedData = data.map(zakazka => ({
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
          telefon: zakazka.telefon || '',  // NEW - telefon pro kalendář
          soubory: zakazka.soubory || []
        }));
        return convertedData;
      }
    } catch (supabaseError) {
      console.log('⚠️ Supabase nedostupný pro zakázky, použiji localStorage:', supabaseError.message);
    }

    // Fallback na localStorage
    console.log('🔄 Načítám zakázky z localStorage pro uživatele:', userId);
    const userData = localStorage.getItem(`paintpro_data_${userId}`);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
        return [];
      }
    }
    
    // Pro výchozího uživatele (id: 1) použij existující data
    if (userId === 1) {
      const defaultData = [
        { id: 1, datum: '10. 6. 2025', druh: 'Adam', klient: 'XY', cislo: '95101', castka: 18200, fee: 4732, material: 700, pomocnik: 4000, palivo: 0, zisk: 8768, adresa: 'Wenceslas Square 1, Prague 1', soubory: [] },
        { id: 2, datum: '9. 6. 2025', druh: 'MVČ', klient: 'XY', cislo: '104470', castka: 7200, fee: 1872, material: 700, pomocnik: 2000, palivo: 0, zisk: 2628, adresa: 'Charles Square 15, Prague 2', soubory: [] },
        { id: 3, datum: '5. 6. 2025', druh: 'Adam', klient: 'XY', cislo: '95105', castka: 11800, fee: 2964, material: 700, pomocnik: 2000, palivo: 300, zisk: 5436, adresa: 'Old Town Square 10, Prague 1', soubory: [] },
        { id: 4, datum: '14. 5. 2025', druh: 'Adam', klient: 'XY', cislo: '80067', castka: 7600, fee: 1976, material: 700, pomocnik: 2000, palivo: 300, zisk: 2924, adresa: 'Kampa Island 5, Prague 1', soubory: [] },
        { id: 5, datum: '13. 5. 2025', druh: 'Adam', klient: 'XY', cislo: '87470', castka: 6400, fee: 1664, material: 700, pomocnik: 2000, palivo: 300, zisk: 1736, adresa: 'Prague Castle, Prague 1', soubory: [] },
        { id: 6, datum: '10. 5. 2025', druh: 'Adam', klient: 'XY', cislo: '91353', castka: 24000, fee: 6240, material: 0, pomocnik: 15780, palivo: 0, zisk: 2000, adresa: 'Letná Park 12, Prague 7', soubory: [] },
        { id: 7, datum: '24. 4. 2025', druh: 'Korálek', klient: 'XY', cislo: '90660', castka: 13200, fee: 3432, material: 0, pomocnik: 0, palivo: 0, zisk: 9768, adresa: 'Vinohrady 25, Prague 2', soubory: [] },
        { id: 8, datum: '22. 4. 2025', druh: 'Adam', klient: 'XY', cislo: '95247', castka: 17800, fee: 4628, material: 300, pomocnik: 700, palivo: 0, zisk: 12172, adresa: 'Smíchov 8, Prague 5', soubory: [] },
        { id: 9, datum: '19. 4. 2025', druh: 'Adam', klient: 'XY', cislo: '91510', castka: 10600, fee: 2756, material: 200, pomocnik: 1000, palivo: 2500, zisk: 4144, adresa: 'Karlín 18, Prague 8', soubory: [] },
        { id: 10, datum: '16. 4. 2025', druh: 'Adam', klient: 'XY', cislo: '91417', castka: 8600, fee: 2184, material: 500, pomocnik: 1000, palivo: 1500, zisk: 3416, adresa: 'Dejvice 32, Prague 6', soubory: [] },
        { id: 11, datum: '15. 3. 2025', druh: 'Ostatní', klient: 'XY', cislo: '18001', castka: 5700, fee: 1462, material: 300, pomocnik: 1000, palivo: 0, zisk: 2938, adresa: 'Nové Město 44, Prague 1', soubory: [] },
        { id: 12, datum: '26. 2. 2025', druh: 'Adam', klient: 'XY', cislo: '14974', castka: 5600, fee: 1456, material: 300, pomocnik: 400, palivo: 0, zisk: 3444, adresa: 'Břevnov 21, Prague 6', soubory: [] },
        { id: 13, datum: '23. 2. 2025', druh: 'Adam', klient: 'XY', cislo: '13161', castka: 8400, fee: 1684, material: 300, pomocnik: 400, palivo: 0, zisk: 4016, adresa: 'Malá Strana 12, Prague 1', soubory: [] },
        { id: 14, datum: '27. 1. 2025', druh: 'Adam', klient: 'XY', cislo: '14347', castka: 8700, fee: 1743, material: 300, pomocnik: 1000, palivo: 0, zisk: 5657, adresa: 'Hradčany 8, Prague 1', soubory: [] }
      ];
      saveUserData(userId, defaultData);
      return defaultData;
    }
    
    // Nový uživatel začíná s prázdnými daty
    return [];
  };

  // Uložení dat uživatele - OPRAVENO pro Supabase
  const saveUserData = async (userId, data) => {
    try {
      console.log('🔄 Synchronizuji zakázky do Supabase pro uživatele:', userId);
      // Toto je fallback funkce - primárně používáme přímé Supabase operace
      localStorage.setItem(`paintpro_data_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('❌ Chyba při ukládání dat:', error);
    }
  };

  // Přidání zakázky pro uživatele - OPRAVENO pro Supabase
  const addUserOrder = async (userId, orderData) => {
    try {
      console.log('🔄 Přidávám zakázku do Supabase:', orderData);
      
      const zisk = orderData.castka - orderData.fee - orderData.material - orderData.pomocnik - orderData.palivo;
      
      // Přidej do Supabase
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
          soubory: orderData.soubory || []  // Array of file objects: {id, name, url, uploadedAt}
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
      console.error('❌ Fallback na localStorage pro addUserOrder:', error);
      // Fallback na původní localStorage logiku
      const currentData = await getUserData(userId);
      const id = currentData.length > 0 ? Math.max(...currentData.map(z => z.id)) + 1 : 1;
      const zisk = orderData.castka - orderData.fee - orderData.material - orderData.pomocnik - orderData.palivo;
      const newOrder = { ...orderData, id, zisk, soubory: [] };
      const updatedData = [...currentData, newOrder];
      await saveUserData(userId, updatedData);
      return updatedData;
    }
  };

  // Přidání kalendářové události - NEW pro kalendář
  const addCalendarOrder = async (userId, eventData) => {
    try {
      console.log('🔄 Přidávám kalendářovou událost do Supabase:', eventData);
      
      // Přidej do Supabase s doplněnými údaji (bez telefon pole prozatím)
      const { data, error } = await supabase
        .from('zakazky')
        .insert([{
          profile_id: userId,
          datum: eventData.datum,
          druh: 'Ostatní', // Výchozí kategorie pro kalendářové události
          klient: eventData.jmeno,
          id_zakazky: `CAL-${Date.now()}`, // Automatické ID pro kalendářové události
          castka: eventData.cena || 0,
          fee: 0,
          fee_off: 0,
          palivo: 0,
          material: 0,
          pomocnik: 0,
          zisk: eventData.cena || 0, // Celá částka jako zisk pro jednoduchost
          adresa: eventData.adresa ? `${eventData.adresa} | Tel: ${eventData.telefon || 'N/A'}` : `Tel: ${eventData.telefon || 'N/A'}`, // Telefon přidáme do adresy
          soubory: [],
          // NEW fields for calendar functionality
          end_date: eventData.endDate || eventData.datum, // Multi-day support
          color: eventData.color || '#4F46E5', // Event color
          status: eventData.status || 'incoming' // Event status
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Chyba při přidávání kalendářové události do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Kalendářová událost úspěšně přidána do Supabase:', data);
      
      // Načti aktualizovaná data
      const updatedData = await getUserData(userId);
      return updatedData;
      
    } catch (error) {
      console.error('❌ Fallback na localStorage pro addCalendarOrder:', error);
      // Fallback na původní localStorage logiku
      const currentData = await getUserData(userId);
      const id = currentData.length > 0 ? Math.max(...currentData.map(z => z.id)) + 1 : 1;
      const newOrder = { 
        id, 
        datum: eventData.datum,
        druh: 'Ostatní',
        klient: eventData.jmeno,
        cislo: `CAL-${Date.now()}`,
        castka: eventData.cena || 0,
        fee: 0,
        material: 0,
        pomocnik: 0,
        palivo: 0,
        zisk: eventData.cena || 0,
        adresa: eventData.adresa ? `${eventData.adresa} | Tel: ${eventData.telefon || 'N/A'}` : `Tel: ${eventData.telefon || 'N/A'}`,
        telefon: eventData.telefon || '',
        soubory: [],
        // NEW fields for calendar functionality
        endDate: eventData.endDate || eventData.datum,
        color: eventData.color || '#4F46E5',
        status: eventData.status || 'incoming'
      };
      const updatedData = [...currentData, newOrder];
      await saveUserData(userId, updatedData);
      return updatedData;
    }
  };

  // Editace zakázky uživatele - OPRAVENO pro Supabase
  const editUserOrder = async (userId, orderId, orderData) => {
    try {
      console.log('🔄 Aktualizuji zakázku v Supabase:', orderId, orderData);
      
      const zisk = orderData.castka - orderData.fee - orderData.material - orderData.pomocnik - orderData.palivo;
      
      // Aktualizuj v Supabase
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
      console.error('❌ Fallback na localStorage pro editUserOrder:', error);
      // Fallback na původní localStorage logiku
      const currentData = await getUserData(userId);
      const zisk = orderData.castka - orderData.fee - orderData.material - orderData.pomocnik - orderData.palivo;
      const updatedData = currentData.map(order => 
        order.id === orderId ? { ...orderData, id: orderId, zisk, soubory: order.soubory || [] } : order
      );
      await saveUserData(userId, updatedData);
      return updatedData;
    }
  };

  // Smazání zakázky uživatele - OPRAVENO pro Supabase
  const deleteUserOrder = async (userId, orderId) => {
    try {
      console.log('🔄 Mažu zakázku z Supabase:', orderId);
      
      // Smaž z Supabase
      const { error } = await supabase
        .from('zakazky')
        .delete()
        .eq('id', orderId)
        .eq('profile_id', userId);
      
      if (error) {
        console.error('❌ Chyba při mazání zakázky z Supabase:', error);
        throw error;
      }
      
      console.log('✅ Zakázka úspěšně smazána z Supabase');
      
      // Načti aktualizovaná data
      const updatedData = await getUserData(userId);
      return updatedData;
      
    } catch (error) {
      console.error('❌ Fallback na localStorage pro deleteUserOrder:', error);
      // Fallback na původní localStorage logiku
      const currentData = await getUserData(userId);
      const updatedData = currentData.filter(order => order.id !== orderId);
      await saveUserData(userId, updatedData);
      return updatedData;
    }
  };

  // Odhlášení uživatele
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('paintpro_user');
  };

  // Přidání nového profilu - OPRAVENO pro Supabase
  const addProfile = async (profileData) => {
    try {
      console.log('🔄 Přidávám profil do Supabase:', profileData);
      
      // Vložit do Supabase
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
      
      // Záloha do localStorage
      localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
      
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
      localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
      return newProfile;
    }
  };

  // Editace profilu - OPRAVENO pro Supabase
  const editProfile = async (profileId, pin, updatedData) => {
    try {
      const profile = profiles.find(p => p.id === profileId && p.pin === pin);
      if (!profile) return false;

      console.log('🔄 Aktualizuji profil v Supabase:', profileId, updatedData);
      
      // Aktualizuj v Supabase
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
      localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
      
      // Aktualizovat current user pokud edituje sebe
      if (currentUser && currentUser.id === profileId) {
        const updatedUser = {
          ...currentUser,
          name: data.name,
          avatar: data.avatar,
          color: data.color
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('paintpro_user', JSON.stringify(updatedUser));
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Fallback na localStorage pro editProfile:', error);
      // Fallback na původní localStorage logiku
      const profile = profiles.find(p => p.id === profileId && p.pin === pin);
      if (!profile) return false;

      const updatedProfiles = profiles.map(p => 
        p.id === profileId 
          ? { 
              ...p, 
              ...updatedData,
              avatar: updatedData.avatar || updatedData.name?.slice(0, 2).toUpperCase() || p.avatar
            }
          : p
      );
      
      setProfiles(updatedProfiles);
      localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
      return true;
    }
  };

  // Smazání profilu - OPRAVENO pro Supabase
  const deleteProfile = async (profileId, pin) => {
    try {
      if (profiles.length <= 1) return false; // Nesmí smazat poslední profil
      
      const profile = profiles.find(p => p.id === profileId && p.pin === pin);
      if (!profile) return false;

      console.log('🔄 Mažu profil z Supabase:', profileId);
      
      // Smaž z Supabase
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      
      if (error) {
        console.error('❌ Chyba při mazání profilu z Supabase:', error);
        throw error;
      }
      
      console.log('✅ Profil úspěšně smazán z Supabase');
      
      // Aktualizuj lokální state
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);
      localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
      
      // Pokud smaže sebe, odhlásit
      if (currentUser && currentUser.id === profileId) {
        logout();
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Fallback na localStorage pro deleteProfile:', error);
      // Fallback na původní localStorage logiku
      if (profiles.length <= 1) return false;
      
      const profile = profiles.find(p => p.id === profileId && p.pin === pin);
      if (!profile) return false;

      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);
      localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
      
      if (currentUser && currentUser.id === profileId) {
        logout();
      }
      
      return true;
    }
  };

  // Získání všech profilů (bez PIN)
  const getProfiles = () => {
    return profiles.map(({ pin, ...profile }) => profile);
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    getProfiles,
    addProfile,
    editProfile,
    deleteProfile,
    getUserData,
    saveUserData,
    addUserOrder,
    addCalendarOrder,  // NEW - kalendářová událost
    editUserOrder,
    deleteUserOrder,
    testSupabaseConnection,  // Přidání test funkce
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};