
# Správa Zakázek - Full Stack Application

React frontend + FastAPI backend aplikace pro správu zakázek s Firebase a Supabase integrací.

## 🚀 Quick Start

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

## 🔧 Environment Setup

### Frontend (.env)
```
WDS_SOCKET_PORT=443
REACT_APP_BACKEND_URL=your-backend-url
```

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY_ID="your-key-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-client-email"
FIREBASE_CLIENT_ID="your-client-id"
FIREBASE_CLIENT_X509_CERT_URL="your-cert-url"
```

## 📱 Features

- 🔐 Multi-profile authentication
- 📊 Advanced dashboard with charts
- 📅 Calendar integration
- 💰 Financial tracking
- 📋 Order management (CRUD)
- 📄 PDF export
- 🗺️ Map integration
- 📱 Responsive design

## 🛠️ Tech Stack

- **Frontend**: React 19, Chart.js, Leaflet, Moment.js
- **Backend**: FastAPI, Firebase Admin SDK
- **Database**: Supabase, Firebase Firestore
- **Styling**: Custom CSS with modern design
- **Authentication**: Firebase Auth + Supabase
