// Firebase konfigurace a inicializace
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyCpZgHoSamBK3Jrr9Ltu1Stsh-2UlzyGF4",
  authDomain: "dusan-sprava-zakazek.firebaseapp.com",
  projectId: "dusan-sprava-zakazek",
  storageBucket: "dusan-sprava-zakazek.firebasestorage.app",
  messagingSenderId: "998111768008",
  appId: "1:998111768008:web:e27331bd924dafa341e4fd",
  measurementId: "G-Z7J18SG25D"
};

// Inicializace Firebase
const app = initializeApp(firebaseConfig);

// Inicializace služeb
export const auth = getAuth(app);
export const db = getFirestore(app);

// Pro development - připojení k emulátor (volitelné)
if (process.env.NODE_ENV === 'development' && !window.location.hostname.includes('localhost')) {
  // Nepřipojujeme k emulátorům v produkci
}

export default app;