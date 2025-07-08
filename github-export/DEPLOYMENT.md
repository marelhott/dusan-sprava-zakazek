
# 🚀 Deployment Guide

Tato aplikace může být nasazena na několika platformách. Níže najdete instrukce pro každou z nich.

## 🔧 Příprava před deploymentem

1. **Nastavte environment proměnné**:
   - Zkopírujte `.env.template` na `.env` v obou složkách (frontend, backend)
   - Vyplňte všechny potřebné hodnoty

2. **Firebase Setup**:
   - Vytvořte Firebase projekt
   - Povolte Authentication a Firestore
   - Stáhněte service account klíč
   - Vyplňte Firebase proměnné do backend `.env`

3. **Supabase Setup**:
   - Vytvořte Supabase projekt
   - Vytvořte potřebné tabulky pomocí `supabase_setup.sql`
   - Vyplňte Supabase proměnné do frontend kódu

## 🌐 Deployment na Vercel (Frontend) + Railway (Backend)

### Frontend (Vercel)
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Backend (Railway)
1. Připojte GitHub repo k Railway
2. Nastavte root directory na `backend`
3. Přidejte environment proměnné
4. Deploy se spustí automaticky

## 🐳 Docker Deployment

```bash
# Lokální vývoj
docker-compose up --build

# Produkce
docker-compose -f docker-compose.prod.yml up --build
```

## ☁️ Replit Deployment

1. Importujte GitHub repo do Replit
2. Nastavte environment proměnné v Secrets
3. Použijte Replit Deployments pro hosting

## 🔍 Health Check Endpoints

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000/docs` (FastAPI docs)
- Backend Health: `http://localhost:8000/health`

## 🔐 Zabezpečení

- Nikdy necommitujte `.env` soubory
- Používejte HTTPS v produkci
- Pravidelně rotujte API klíče
- Nastavte CORS správně pro produkční doménu
