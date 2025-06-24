import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const savedProfiles = localStorage.getItem('paintpro_profiles');
    const savedUser = localStorage.getItem('paintpro_user');
    
    if (savedProfiles) {
      try {
        const profilesData = JSON.parse(savedProfiles);
        setProfiles(profilesData);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setProfiles([DEFAULT_PROFILE]);
        localStorage.setItem('paintpro_profiles', JSON.stringify([DEFAULT_PROFILE]));
      }
    } else {
      // První spuštění - vytvoř výchozí profil
      setProfiles([DEFAULT_PROFILE]);
      localStorage.setItem('paintpro_profiles', JSON.stringify([DEFAULT_PROFILE]));
    }

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        localStorage.removeItem('paintpro_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Přihlášení uživatele
  const login = (profileId, pin) => {
    const profile = profiles.find(p => p.id === profileId && p.pin === pin);
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
      return true;
    }
    return false;
  };

  // Odhlášení uživatele
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('paintpro_user');
  };

  // Přidání nového profilu
  const addProfile = (profileData) => {
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
  };

  // Editace profilu
  const editProfile = (profileId, pin, updatedData) => {
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
    
    // Aktualizovat current user pokud edituje sebe
    if (currentUser && currentUser.id === profileId) {
      const updatedUser = updatedProfiles.find(p => p.id === profileId);
      setCurrentUser({
        ...currentUser,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        color: updatedUser.color,
        image: updatedUser.image
      });
      localStorage.setItem('paintpro_user', JSON.stringify({
        ...currentUser,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        color: updatedUser.color,
        image: updatedUser.image
      }));
    }
    
    return true;
  };

  // Smazání profilu
  const deleteProfile = (profileId, pin) => {
    if (profiles.length <= 1) return false; // Nesmí smazat poslední profil
    
    const profile = profiles.find(p => p.id === profileId && p.pin === pin);
    if (!profile) return false;

    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
    
    // Pokud smaže sebe, odhlásit
    if (currentUser && currentUser.id === profileId) {
      logout();
    }
    
    return true;
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
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};