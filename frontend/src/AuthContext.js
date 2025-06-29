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

  // Získání dat uživatele
  const getUserData = (userId) => {
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

  // Uložení dat uživatele
  const saveUserData = (userId, data) => {
    localStorage.setItem(`paintpro_data_${userId}`, JSON.stringify(data));
  };

  // Přidání zakázky pro uživatele
  const addUserOrder = (userId, orderData) => {
    const currentData = getUserData(userId);
    const id = currentData.length > 0 ? Math.max(...currentData.map(z => z.id)) + 1 : 1;
    const zisk = orderData.castka - orderData.fee - orderData.material - orderData.pomocnik - orderData.palivo;
    const newOrder = { ...orderData, id, zisk, soubory: [] };
    const updatedData = [...currentData, newOrder];
    saveUserData(userId, updatedData);
    return updatedData;
  };

  // Editace zakázky uživatele
  const editUserOrder = (userId, orderId, orderData) => {
    const currentData = getUserData(userId);
    const zisk = orderData.castka - orderData.fee - orderData.material - orderData.pomocnik - orderData.palivo;
    const updatedData = currentData.map(order => 
      order.id === orderId ? { ...orderData, id: orderId, zisk, soubory: order.soubory || [] } : order
    );
    saveUserData(userId, updatedData);
    return updatedData;
  };

  // Smazání zakázky uživatele
  const deleteUserOrder = (userId, orderId) => {
    const currentData = getUserData(userId);
    const updatedData = currentData.filter(order => order.id !== orderId);
    saveUserData(userId, updatedData);
    return updatedData;
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
    getUserData,
    saveUserData,
    addUserOrder,
    editUserOrder,
    deleteUserOrder,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};