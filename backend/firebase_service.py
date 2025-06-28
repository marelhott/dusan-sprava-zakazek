import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from typing import Dict, Any, List, Optional

# Firebase Service Account JSON
SERVICE_ACCOUNT_JSON = {
  "type": "service_account",
  "project_id": "dusan-sprava-zakazek",
  "private_key_id": "b84ab3800538611d54b51c3978e780ee263b7651",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCJZ+f2D8uuRCf0\nSuGGspWzpnRIMzaMlFC7zOajf1vsezGv6Z+B9VtW0MSlFChvJ7Y+xPA2NEY1M/1Z\nCKveX7uZAecMaKv4/VUif3qgO+n4KQu6JdHogz9vPVikJdEn7LiLG/IVzvYypB+/\ntcisk/mfrA24Ik1NTQ6KBkP6SmKWnlf2E0iHctd+26IFw4NJYWtLI6tt7cfHhlBq\nGO1DK0UJktlFrPvEIHSSwVWa8Xmim7rEEKw/ZC0sVJkMxK4nWFU+yDHzlP1VGn/p\ns8vMxHrNUfMTci9b0MLdSQXFYOGaU3DLRp7n1i7CUMl62rRSqZ0F9viDjMShrQQ2\ndQvn+jM1AgMBAAECggEAEQCkAd0rgXlajk6TwJSplIzU17hKmDOkF9D/exy/1a/a\n0p8whybCsifsJVcst7BsyzCYXsSyKVQxFcrOZZpn/sNvASiUmx9R4Q5wMJKpXXVK\nx7J1WnWfLFcleE5bprqSjVgcaRlueo63hQPr/HrlCR6DphTMhvOxiF/FGpwIvgVU\ngk3d5q9F0NkBQgcSdB0E1BfC0/lHuYQC5cDOcNnoILZ7e/kyR96KzgH84V9MqQJW\nA3lVFZzCu1GRmFQ8cLUZiIoX779U0wkXBtZJj4i9b7uJwF+Z8kXGKMI7iBGWn18V\nOh4sxF/9Gcyimfxij3eV8w6HaR5YxYYpWIS7Cs/wcwKBgQDBPhN4qGCOF8F6mX0T\nvCBZcPKzPJJm611t6MpbsrpFiFGzsUyzy8273GA86XvYdhrYtR3rgsVYKyMr3D9T\nztPLt5biJLiUECOUEs8ulCWHKd37It3IVHccrLVPvlfHwJExD8B/7xXeQCIwwoha\ntSyZHatx5O1Cb2hjcUwTwI+h3wKBgQC2B6YnE3wGAF67YXfvUSpfzkWF0JkOSOda\nP+hUbZBMXnaRu4/cmv+I2pgfdAHCLyO1qgPEIdD3gYHVLW695aACbcbFUxs2m2p9\nSngSM6O0H+0UTmuDDJlrJBRbXuarjbiR/f5FqBZOZnExNHqM4tquDdBthLqxKF+n\nfQps7B3VawKBgHIGfhjRSgAuVlVQYnSVqoT8V8mZcU3Xjg6/sUBAixdiY8tjUD47\ngQ9b71Gh+Bj3P8olvRzt0iK/eYZ09M0wGtt3XkncnymHCGdkXeo/MpG6C6kXnsSJ\nyqsZ4fbG+yb8IvBPOiiDXGUDdOlOsITNqR5EWpjfG3z7Hh6niNuS4W4DAoGAbPen\nPz0qwWz3SLTQVzL/atrQQ4rcFPEPjbc0HVZ5Sz5BPHxLYoRm9EXnSuznIJeXiOh9\n2KtlrMSaNEM+R+9uGgYdN4LIh6gB13784eiH1wxFoCJRueGQ9dJjXU8yRwBPvRWP\nYaN9tvEcUZhYxH4I6qjaXLVYDTVeDaWM2CeAtIECgYB6zZOZ0vJrULxDsbjSP2z+\nWnxZxNtk6seWviUe45j1xvXnnmvbQFRg6B0M7yOOjwZJ0nY17TKa6e6LoxAPUiTL\nRgaFGDdLY6JBRrP8zoFu9map3vKY+JibYg+163PjrWkGnsiS4Jv0cJsd7uLeA37f\nHYYVWtQd0aGNqYrs3+KjRw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@dusan-sprava-zakazek.iam.gserviceaccount.com",
  "client_id": "107426721719531849468",
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