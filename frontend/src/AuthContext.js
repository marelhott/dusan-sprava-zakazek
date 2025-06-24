import React, { createContext, useContext, useState, useEffect } from 'react';

// Profily uživatelů (můžete upravit podle potřeby)
const PROFILES = [
  { id: 1, name: "Jan Malíř", pin: "123456", avatar: "JM", color: "#4F46E5" },
  { id: 2, name: "Marie Nová", pin: "654321", avatar: "MN", color: "#10B981" },
  { id: 3, name: "Petr Admin", pin: "111111", avatar: "PA", color: "#F59E0B" },
  { id: 4, name: "Anna Účetní", pin: "222222", avatar: "AÚ", color: "#EF4444" },
  { id: 5, name: "Tomáš Vedoucí", pin: "333333", avatar: "TV", color: "#8B5CF6" },
];

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

  // Kontrola session při načtení
  useEffect(() => {
    const savedUser = localStorage.getItem('paintpro_user');
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
    const profile = PROFILES.find(p => p.id === profileId && p.pin === pin);
    if (profile) {
      const user = {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
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

  // Získání všech profilů (bez PIN)
  const getProfiles = () => {
    return PROFILES.map(({ pin, ...profile }) => profile);
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    getProfiles,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};