# Dušan - Správa zakázek

## 🎨 Malířská zakázková aplikace

Kompletní systém pro správu malířských zakázek s real-time synchronizací přes Firebase.

### ✨ Funkce
- 📊 **Dashboard** s přehledem tržeb, zisku a zakázek
- 📝 **Správa zakázek** s filtry a vyhledáváním  
- 📈 **Reporty** s interaktivními grafy
- 🗺️ **Mapa zakázek** s OpenStreetMap
- 📄 **PDF export** všech stránek v horizontálním formátu
- 🔐 **PIN autentizace** pro bezpečný přístup
- ☁️ **Firebase sync** - data v cloudu, přístupná odkudkoliv

### 🚀 Deployment

#### Environment Variables (Firebase):
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain  
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Railway Deployment:
1. Connect GitHub repository
2. Set environment variables 
3. Deploy both frontend and backend
4. Frontend: `yarn build && yarn start`
5. Backend: `pip install -r requirements.txt && uvicorn server:app --host 0.0.0.0 --port $PORT`

### 👤 Přihlášení
- **PIN**: 1234
- **Uživatel**: Dušan

### 🔧 Tech Stack
- **Frontend**: React 19, Chart.js, Leaflet, Tailwind CSS
- **Backend**: FastAPI, Firebase Admin SDK
- **Database**: Firebase Firestore
- **PDF**: jsPDF + html2canvas

### 📱 Features
- Responsivní design
- Real-time data synchronizace
- Offline první přihlášení (localStorage)
- Cloud backup všech dat
- Multi-uživatelská podpora

---
*Vytvořeno pro efektivní správu malířských zakázek s moderními technologiemi.*