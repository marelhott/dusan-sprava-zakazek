# 🚀 Deployment Instructions - Dušan Správa zakázek

## 📋 Před deploymentem

### 1. GitHub Export
- V Emergent chatu klikněte **"Save to GitHub"**
- Zadejte název repository: `dusan-sprava-zakazek`
- Nastavte jako **public** nebo **private** dle preference

### 2. Firebase Credentials
**⚠️ DŮLEŽITÉ:** Před deploymentem musíte nahradit Firebase credentials!

V souboru `/backend/firebase_service.py` nahraďte placeholders:
```python
SERVICE_ACCOUNT_JSON = {
  # Nahraďte "your_xxx" skutečnými hodnotami z Firebase Console
  "private_key_id": "your_private_key_id",  # ← NAHRADIT
  "private_key": "-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n",  # ← NAHRADIT  
  "client_id": "your_client_id",  # ← NAHRADIT
  # Ostatní hodnoty jsou správné
}
```

## 🌐 Railway Deployment

### 1. Registrace na Railway
- Jděte na [railway.app](https://railway.app)
- Registrujte se pomocí GitHub účtu

### 2. Deploy z GitHub
1. **New Project** → **Deploy from GitHub repo**
2. Vyberte repository `dusan-sprava-zakazek`
3. Railway automaticky detekuje React + FastAPI

### 3. Environment Variables
V Railway dashboard nastavte:

**Frontend Environment:**
```
VITE_FIREBASE_API_KEY=AIzaSyCpZgHoSamBK3Jrr9Ltu1Stsh-2UlzyGF4
VITE_FIREBASE_AUTH_DOMAIN=dusan-sprava-zakazek.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dusan-sprava-zakazek
VITE_FIREBASE_STORAGE_BUCKET=dusan-sprava-zakazek.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=998111768008
VITE_FIREBASE_APP_ID=1:998111768008:web:e27331bd924dafa341e4fd
```

### 4. Build Commands
Railway automaticky nastaví, ale pro jistotu:

**Frontend:**
- Build: `yarn install && yarn build`
- Start: `yarn start`

**Backend:**
- Build: `pip install -r requirements.txt`  
- Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`

## 🔗 Po Deployment

### 1. Získání URL
- Railway vygeneruje URL typu: `https://dusan-sprava-zakazek-production.up.railway.app`
- Tuto URL můžete sdílet s kýmkoliv

### 2. Test aplikace
1. Otevřete URL v prohlížeči
2. Přihlaste se PIN: **1234**
3. Otestujte všechny funkce

### 3. Vlastní doména (volitelné)
- V Railway Settings můžete přidat custom doménu
- Např: `zakazky.dusanmalir.cz`

## 🔄 Budoucí Updates

### Workflow pro úpravy:
1. **Požadavky specifikujte zde v Emergent chatu**
2. **Já implementuji změny**
3. **Push do GitHub** → Railway automaticky nasadí
4. **Nová verze je live** během 2-3 minut

## 🆘 Troubleshooting

### Běžné problémy:
1. **Firebase credentials chyba**: Zkontrolujte SERVICE_ACCOUNT_JSON
2. **Build fails**: Zkontrolujte environment variables
3. **404 errors**: Zkontrolujte routing a CORS nastavení

### Kontakt pro support:
- **Urgentní problémy**: Napište do Emergent chatu
- **Minor úpravy**: Specifikujte požadavky, já je implementuji

---

## 📱 Finální checklist

- [ ] GitHub repository vytvořeno
- [ ] Firebase credentials nahrazeny
- [ ] Railway projekt vytvořen
- [ ] Environment variables nastaveny
- [ ] Aplikace úspěšně deployed
- [ ] Test přihlášení PIN 1234
- [ ] URL sdílena s uživateli

**🎉 Gratulace! Vaše aplikace je nyní dostupná online!**