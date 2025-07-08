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
V Railway dashboard nastavte tyto proměnné:

**Frontend Environment:**
```
VITE_FIREBASE_API_KEY=AIzaSyCpZgHoSamBK3Jrr9Ltu1Stsh-2UlzyGF4
VITE_FIREBASE_AUTH_DOMAIN=dusan-sprava-zakazek.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dusan-sprava-zakazek
VITE_FIREBASE_STORAGE_BUCKET=dusan-sprava-zakazek.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=998111768008
VITE_FIREBASE_APP_ID=1:998111768008:web:e27331bd924dafa341e4fd
```

**Backend Environment (Z NOVÉHO Firebase JSON souboru):**
```
FIREBASE_PROJECT_ID=dusan-sprava-zakazek
FIREBASE_PRIVATE_KEY_ID=fc7c89110c010f7c97bda01f71f09fe4608ace66
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCpneEl5g2DZaeD\naoZJ80RAIIaQqheqOYqhS1BW74D0paqYdEoWlZQoo2o44bRzVhNUq9gsPZuPN03R\nZmEfdPz/Z0WzeQ0j5mkaJFmnzlecnNg2va0YURe1chZ6cHeZDwb2PqBCgy3D0HS6\ngT0g2sNhZWxTIP0zfmTLt/GrqoOgXySSxNqjkc9Glmq9y01trd8unmOQkpPG7ehb\n8N7+gwruK8SyDkEH2tUNVmtuIaTb4hriG/gBxGJ9lKls1S/minorr0wu4Yo/+uFi\n1MDE4LQgCIiIAUHUrZmRgkjV3D5LUlw8g+Vf08dEi6uvLEW/Ii3OTvW2K8+YV3G/\ncaHTnwE1AgMBAAECggEAHyz5Y9Ohwre1vyoediusLQQ9b4wP7vYGFMjowp3hbDYi\nAcUIFBgYpBKLNNrJZdSZl3vBbzpApCV0XGtuqQ9B7DjBXzA9+c4BHfC1+OmsgUjz\n1bXtwZUwICXQ217eIKgaLbsLjkYZrI7dUaVtBKOo+zce3rWmzGbsJGSSGy0rZdei\nOCU0J/cful7/wzy0c2S36l9PP2i/wkpbAmWf0Zchsih/keX1vFCt9mTYHcZe74Vw\navluS8BWLe33XhpEIZZikFNFYFGF/RngM/wx4HeGHZuFiZ4N2VsxZu+WSNmtAvBb\nZqiayYLNG+ljyaKB8Md1CImHE+pjNhqEO7wIGgv6MQKBgQDeW9JnplSeZxr1IQek\nFSoE2ZKVmq9ZzRRTgCD4aCcu9kaH40kBS352rd8DgLM+OZmn0BgKeICjBkIFHnaN\negQsbDiJvVEbGL6arBVqdXaz++P1wsYJjmSDKcW66sav4NmnVGZQ++noUpvqo0UU\n4xNBLldnNjdGE2j4yu6uC7sM0QKBgQDDR07DRt9QuvSRdAOBOCTph+9veozGGM/m\nZfyJYB5hgEXQVTIveiwcABnOJgbDzmvg3fCVIMZcWwnIV+CSSTE7mWpHuGJjzUha\nCQBXG+qg3p5K93AeFprkjiEKjcV/GebH9YUzpbbR/hkjg2NO3JzvrLjwiFnCXTNo\nZkkTONF3JQKBgQDALdgh4S4NYct4xT1XYTtZybnZN0IKeSbyLDFSwKHtAsletN/q\nEJeSdx/iZR+Fzj6xPTcqBZAYVlZFGlkYWba1tir/UPKCWtaR090Gj9MyJ6iURezn\nYXwZqMbOkA98/vbemiF8KN22/37mQop4TPHdSfIcsE0BcdEuBiZXoqfdoQKBgQDC\nvT3ip67UB10WIKfOGXtWGGXCumfgtaW+kj5BkUU63nzAwfWGO0P5uHADkRB1/EjA\nuxPM5B5sw60BygD+YVdjpB7E3y/fbzyT7R4VwJU/UEJzaEa6+rgE7Wgt6ivmEKKB\nDmuDkeK7j7bqH4DNiFxI9+qGlLNOjTtTBY4iSSs6sQKBgQCFb6UN4wmqLsKZiqY5\nbECclCEIvVv5IR8fd9J6c/HyZvfflyELcavp3wA6l1JGu/1UjSjJa4ZxVoWTF5wz\nEAcTQPwk4XgOn29Ok6NC0ug1M/sOQkLPJT5NVMJFCYIAXZJUwQNjh5q11vZqgTz3\n2cgOJgcQcWDc9Jvz4+6ONhUQIw==\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@dusan-sprava-zakazek.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=107426721719531849468
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40dusan-sprava-zakazek.iam.gserviceaccount.com
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