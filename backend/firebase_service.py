import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from typing import Dict, Any, List, Optional

# Firebase Service Account JSON - REPLACE WITH YOUR CREDENTIALS
SERVICE_ACCOUNT_JSON = {
  "type": "service_account",
  "project_id": "dusan-sprava-zakazek",
  "private_key_id": "your_private_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@dusan-sprava-zakazek.iam.gserviceaccount.com",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40dusan-sprava-zakazek.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

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
        """Inicializace Firebase Admin SDK"""
        try:
            # Kontrola, zda již není Firebase inicializován
            if not firebase_admin._apps:
                # Inicializace pomocí Service Account
                cred = credentials.Certificate(SERVICE_ACCOUNT_JSON)
                self._app = firebase_admin.initialize_app(cred)
                print("✅ Firebase Admin SDK úspěšně inicializován")
            else:
                self._app = firebase_admin.get_app()
                print("✅ Firebase Admin SDK již inicializován")
                
            # Inicializace Firestore klienta
            self._db = firestore.client()
            print("✅ Firestore klient úspěšně inicializován")
            
        except Exception as e:
            print(f"❌ Chyba při inicializaci Firebase: {e}")
            raise
    
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