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

  // Dummy funkce pro kompatibilitu
  const getUserData = async () => [];
  const addUserOrder = async () => [];
  const editUserOrder = async () => [];
  const deleteUserOrder = async () => [];
  const addProfile = async () => ({});
  const editProfile = async () => true;
  const deleteProfile = async () => true;
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