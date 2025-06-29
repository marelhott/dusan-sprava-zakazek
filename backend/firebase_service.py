import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from typing import Dict, Any, List, Optional

class FirebaseService:
    _instance = None
    _app = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self._initialize_firebase()
            self._initialized = True
    
    def _initialize_firebase(self):
        """Inicializace Firebase Admin SDK s fallback pro produkci"""
        try:
            # Kontrola, zda jsou k dispozici Firebase credentials
            required_env_vars = ['FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL']
            missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
            
            if missing_vars:
                print(f"⚠️ Firebase credentials chybí ({', '.join(missing_vars)})")
                print("🔄 Firebase service běží v 'fallback' režimu - data spravuje Supabase")
                self._app = None
                self._db = None
                return
            
            # Kontrola, zda již není Firebase inicializován
            if not firebase_admin._apps:
                # Použijeme environment variables místo hardcoded credentials
                firebase_credentials = {
                    "type": "service_account",
                    "project_id": os.environ.get('FIREBASE_PROJECT_ID', 'dusan-sprava-zakazek'),
                    "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
                    "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
                    "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
                    "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": os.environ.get('FIREBASE_CLIENT_X509_CERT_URL'),
                    "universe_domain": "googleapis.com"
                }
                
                # Inicializace pomocí environment variables
                cred = credentials.Certificate(firebase_credentials)
                self._app = firebase_admin.initialize_app(cred)
                print("✅ Firebase Admin SDK úspěšně inicializován")
            else:
                self._app = firebase_admin.get_app()
                print("✅ Firebase Admin SDK již inicializován")
                
            # Inicializace Firestore klienta
            self._db = firestore.client()
            print("✅ Firestore klient úspěšně inicializován")
            
        except Exception as e:
            print(f"⚠️ Firebase nedostupný: {e}")
            print("🔄 Firebase service běží v 'fallback' režimu - data spravuje Supabase")
            self._app = None
            self._db = None
    
    @property
    def db(self):
        """Getter pro Firestore databázi"""
        return self._db
    
    async def create_user_data(self, user_id: str, data: Dict[str, Any]) -> bool:
        """Vytvoření uživatelských dat"""
        try:
            user_ref = self._db.collection('users').document(user_id)
            user_ref.set(data, merge=True)
            return True
        except Exception as e:
            print(f"❌ Chyba při vytváření uživatelských dat: {e}")
            return False
    
    async def get_user_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Získání uživatelských dat"""
        try:
            user_ref = self._db.collection('users').document(user_id)
            doc = user_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"❌ Chyba při získávání uživatelských dat: {e}")
            return None
    
    async def update_user_data(self, user_id: str, data: Dict[str, Any]) -> bool:
        """Aktualizace uživatelských dat"""
        try:
            user_ref = self._db.collection('users').document(user_id)
            user_ref.update(data)
            return True
        except Exception as e:
            print(f"❌ Chyba při aktualizaci uživatelských dat: {e}")
            return False
    
    async def add_zakazka(self, user_id: str, zakazka_data: Dict[str, Any]) -> Optional[str]:
        """Přidání nové zakázky pro uživatele"""
        try:
            zakazky_ref = self._db.collection('users').document(user_id).collection('zakazky')
            doc_ref = zakazky_ref.add(zakazka_data)
            return doc_ref[1].id  # Vrátí ID nově vytvořené zakázky
        except Exception as e:
            print(f"❌ Chyba při přidávání zakázky: {e}")
            return None
    
    async def get_user_zakazky(self, user_id: str) -> List[Dict[str, Any]]:
        """Získání všech zakázek uživatele"""
        try:
            zakazky_ref = self._db.collection('users').document(user_id).collection('zakazky')
            docs = zakazky_ref.stream()
            zakazky = []
            for doc in docs:
                zakazka = doc.to_dict()
                zakazka['id'] = doc.id
                zakazky.append(zakazka)
            return zakazky
        except Exception as e:
            print(f"❌ Chyba při získávání zakázek: {e}")
            return []
    
    async def update_zakazka(self, user_id: str, zakazka_id: str, zakazka_data: Dict[str, Any]) -> bool:
        """Aktualizace zakázky"""
        try:
            zakazka_ref = self._db.collection('users').document(user_id).collection('zakazky').document(zakazka_id)
            zakazka_ref.update(zakazka_data)
            return True
        except Exception as e:
            print(f"❌ Chyba při aktualizaci zakázky: {e}")
            return False
    
    async def delete_zakazka(self, user_id: str, zakazka_id: str) -> bool:
        """Smazání zakázky"""
        try:
            zakazka_ref = self._db.collection('users').document(user_id).collection('zakazky').document(zakazka_id)
            zakazka_ref.delete()
            return True
        except Exception as e:
            print(f"❌ Chyba při mazání zakázky: {e}")
            return False

# Singleton instance
firebase_service = FirebaseService()

# Export pro použití v aplikaci
def get_firebase_service() -> FirebaseService:
    return firebase_service