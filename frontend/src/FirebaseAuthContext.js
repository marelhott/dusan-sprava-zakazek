import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth musí být použit v AuthProvider');
  }
  return context;
};

// Výchozí profil (zachováno z původního kódu)
const DEFAULT_PROFILE = {
  id: 'user_1',
  name: 'Dušan',
  avatar: '👨‍🎨',
  color: '#8b5cf6',
  pin: '1234'
};

// Výchozí data zakázek (zachováno z původního kódu)
const DEFAULT_ZAKAZKY_DATA = [
  {
    id: 'z1',
    datum: '15. 1. 2024',
    druh: 'Adam',
    klient: 'Jan Novák',
    idZakazky: 'ZAK001',
    castka: 25000,
    fee: 2500,
    feeOff: 0,
    palivo: 800,
    material: 3200,
    pomocnik: 1200,
    zisk: 17300,
    adresa: 'Václavské náměstí 1, Praha 1',
    soubory: []
  },
  {
    id: 'z2',
    datum: '20. 1. 2024',
    druh: 'MVČ',
    klient: 'Marie Svobodová',
    idZakazky: 'ZAK002',
    castka: 18000,
    fee: 1800,
    feeOff: 200,
    palivo: 600,
    material: 2800,
    pomocnik: 0,
    zisk: 12600,
    adresa: 'Národní třída 15, Praha 1',
    soubory: []
  },
  {
    id: 'z3',
    datum: '25. 1. 2024',
    druh: 'Korálek',
    klient: 'Petr Dvořák',
    idZakazky: 'ZAK003',
    castka: 32000,
    fee: 3200,
    feeOff: 0,
    palivo: 1200,
    material: 4500,
    pomocnik: 2000,
    zisk: 21100,
    adresa: 'Wenceslas Square 14, Prague',
    soubory: []
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zakazkyData, setZakazkyData] = useState([]);
  const [profiles, setProfiles] = useState([]);

  // Inicializace při načtení komponenty
  useEffect(() => {
    const loadedProfiles = loadProfiles();
    setProfiles(loadedProfiles);
    initializeApp();
  }, []);

  const loadProfiles = () => {
    try {
      const savedProfiles = localStorage.getItem('paintpro_profiles');
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        return parsed;
      } else {
        // Pokud neexistují profily, vytvoříme výchozí
        localStorage.setItem('paintpro_profiles', JSON.stringify([DEFAULT_PROFILE]));
        return [DEFAULT_PROFILE];
      }
    } catch (error) {
      console.error('❌ Chyba při načítání profilů:', error);
      return [DEFAULT_PROFILE];
    }
  };

  // Real-time listener pro data uživatele
  useEffect(() => {
    if (currentUser?.id) {
      const userDocRef = doc(db, 'users', currentUser.id);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          if (userData.zakazky) {
            setZakazkyData(userData.zakazky);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser?.id]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Zkusíme načíst uživatele z localStorage (pro zachování přihlášení)
      const savedUser = localStorage.getItem('paintpro_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        await loadUserData(user);
      }
    } catch (error) {
      console.error('❌ Chyba při inicializaci aplikace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser(user);
        setZakazkyData(userData.zakazky || []);
      } else {
        // Pokud uživatel neexistuje v Firebase, vytvoříme ho s výchozími daty
        await createUserInFirebase(user);
        setCurrentUser(user);
        setZakazkyData(DEFAULT_ZAKAZKY_DATA);
      }
    } catch (error) {
      console.error('❌ Chyba při načítání uživatelských dat:', error);
    }
  };

  const createUserInFirebase = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, {
        profile: user,
        zakazky: DEFAULT_ZAKAZKY_DATA,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Uživatel vytvořen v Firebase');
    } catch (error) {
      console.error('❌ Chyba při vytváření uživatele v Firebase:', error);
      throw error;
    }
  };

  const login = async (pin) => {
    try {
      // Najdeme profil podle PIN (zachováváme původní logiku)
      const profile = profiles.find(p => p.pin === pin);
      if (!profile) {
        throw new Error('Neplatný PIN');
      }

      await loadUserData(profile);
      
      // Uložíme do localStorage pro zachování přihlášení
      localStorage.setItem('paintpro_user', JSON.stringify(profile));
      
      return true;
    } catch (error) {
      console.error('❌ Chyba při přihlášení:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setZakazkyData([]);
    localStorage.removeItem('paintpro_user');
  };

  const saveUserData = async (userId, data) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        zakazky: data,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Data uložena do Firebase');
    } catch (error) {
      console.error('❌ Chyba při ukládání dat do Firebase:', error);
      throw error;
    }
  };

  const addZakazka = async (zakazkaData) => {
    try {
      const newZakazka = {
        ...zakazkaData,
        id: `z${Date.now()}`, // Jednoduché ID
      };
      
      const updatedZakazky = [...zakazkyData, newZakazka];
      setZakazkyData(updatedZakazky);
      
      await saveUserData(currentUser.id, updatedZakazky);
      return newZakazka;
    } catch (error) {
      console.error('❌ Chyba při přidávání zakázky:', error);
      throw error;
    }
  };

  const updateZakazka = async (zakazkaId, zakazkaData) => {
    try {
      const updatedZakazky = zakazkyData.map(z => 
        z.id === zakazkaId ? { ...z, ...zakazkaData } : z
      );
      setZakazkyData(updatedZakazky);
      
      await saveUserData(currentUser.id, updatedZakazky);
      return true;
    } catch (error) {
      console.error('❌ Chyba při aktualizaci zakázky:', error);
      throw error;
    }
  };

  const deleteZakazka = async (zakazkaId) => {
    try {
      const updatedZakazky = zakazkyData.filter(z => z.id !== zakazkaId);
      setZakazkyData(updatedZakazky);
      
      await saveUserData(currentUser.id, updatedZakazky);
      return true;
    } catch (error) {
      console.error('❌ Chyba při mazání zakázky:', error);
      throw error;
    }
  };

  const getProfiles = () => {
    return profiles;
  };

  const addProfile = async (profileData) => {
    try {
      const newProfile = {
        ...profileData,
        id: `user_${Date.now()}`,
      };
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      
      // Uložíme do localStorage pro zachování
      localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
      
      return newProfile;
    } catch (error) {
      console.error('❌ Chyba při přidávání profilu:', error);
      throw error;
    }
  };

  const editProfile = async (profileId, profileData) => {
    try {
      const updatedProfiles = profiles.map(p => 
        p.id === profileId ? { ...p, ...profileData } : p
      );
      setProfiles(updatedProfiles);
      
      // Uložíme do localStorage pro zachování
      localStorage.setItem('paintpro_profiles', JSON.stringify(updatedProfiles));
      
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
    saveUserData,
    getProfiles,
    addProfile,
    editProfile,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;