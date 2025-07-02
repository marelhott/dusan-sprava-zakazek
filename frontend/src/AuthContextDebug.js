import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from './supabaseClient';

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
  const [debugInfo, setDebugInfo] = useState(['🔄 AuthProvider inicializace']);

  const addDebug = (message) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      addDebug('🔄 Spouštím inicializaci aplikace');
      setIsLoading(true);
      
      // Test 1: Načtení profilů z Supabase
      addDebug('📋 Načítám profily z Supabase...');
      const { data: supabaseProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (!profilesError && supabaseProfiles && supabaseProfiles.length > 0) {
        addDebug(`✅ Načteno ${supabaseProfiles.length} profilů z Supabase`);
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
        addDebug('⚠️ Supabase profily nenačteny, použiji fallback');
        setProfiles([DEFAULT_PROFILE]);
      }
      
      // Test 2: Načtení uloženého uživatele
      addDebug('👤 Kontroluji localStorage pro uloženého uživatele');
      const savedUser = localStorage.getItem('paintpro_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
          addDebug(`✅ Uživatel načten: ${userData.name}`);
        } catch (error) {
          addDebug(`❌ Chyba při parsování uživatele: ${error.message}`);
        }
      } else {
        addDebug('👤 Žádný uložený uživatel v localStorage');
      }
      
      addDebug('✅ Inicializace dokončena');
      
    } catch (error) {
      addDebug(`❌ Chyba při inicializaci: ${error.message}`);
    } finally {
      addDebug('🔓 Nastavuji isLoading = false');
      setIsLoading(false);
    }
  };

  const login = (pin) => {
    addDebug(`🔐 Pokus o přihlášení s PIN: ${pin}`);
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
      addDebug(`✅ Přihlášení úspěšné: ${user.name}`);
      return true;
    }
    
    addDebug('❌ PIN nenalezen');
    return false;
  };

  const logout = () => {
    addDebug('🚪 Odhlašování uživatele');
    setCurrentUser(null);
    localStorage.removeItem('paintpro_user');
  };

  const getUserData = async (userId) => {
    // Zjednodušená verze - vrací prázdná data
    addDebug(`📊 Načítám data pro uživatele: ${userId}`);
    return [];
  };

  const getProfiles = () => {
    return profiles.map(({ pin, ...profile }) => profile);
  };

  // Dummy funkce pro kompatibilitu
  const addUserOrder = async () => { return []; };
  const editUserOrder = async () => { return []; };
  const deleteUserOrder = async () => { return []; };
  const addProfile = async () => { return {}; };
  const editProfile = async () => { return true; };

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
    isAuthenticated: !!currentUser,
    debugInfo // Pro debugging
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};