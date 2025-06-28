from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from .firebase_service import get_firebase_service


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firebase service
firebase_service = get_firebase_service()

# Create the main app without a prefix
app = FastAPI(title="Dušan - Správa zakázek", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ZakazkaCreate(BaseModel):
    datum: str
    druh: str
    klient: str
    idZakazky: str
    castka: float
    fee: float
    feeOff: float
    palivo: float
    material: float
    pomocnik: float
    zisk: float
    adresa: str
    soubory: List[str] = []

class ZakazkaUpdate(BaseModel):
    datum: Optional[str] = None
    druh: Optional[str] = None
    klient: Optional[str] = None
    idZakazky: Optional[str] = None
    castka: Optional[float] = None
    fee: Optional[float] = None
    feeOff: Optional[float] = None
    palivo: Optional[float] = None
    material: Optional[float] = None
    pomocnik: Optional[float] = None
    zisk: Optional[float] = None
    adresa: Optional[str] = None
    soubory: Optional[List[str]] = None

class UserData(BaseModel):
    userId: str
    zakazky: List[Dict[str, Any]]


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Dušan - Správa zakázek API", "status": "running", "firebase": "connected"}

# Status check endpoints (pro testování)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    # Pro jednoduchost zatím bez ukládání do Firebase
    return status_obj

@api_router.get("/status")
async def get_status_checks():
    return {"message": "Status checks - Firebase API", "timestamp": datetime.utcnow()}

# Firebase zakázky endpoints
@api_router.get("/users/{user_id}/zakazky")
async def get_user_zakazky(user_id: str):
    """Získání všech zakázek uživatele"""
    try:
        zakazky = await firebase_service.get_user_zakazky(user_id)
        return {"zakazky": zakazky}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chyba při načítání zakázek: {str(e)}")

@api_router.post("/users/{user_id}/zakazky")
async def create_zakazka(user_id: str, zakazka: ZakazkaCreate):
    """Vytvoření nové zakázky"""
    try:
        zakazka_id = await firebase_service.add_zakazka(user_id, zakazka.dict())
        if zakazka_id:
            return {"message": "Zakázka úspěšně vytvořena", "zakazka_id": zakazka_id}
        else:
            raise HTTPException(status_code=500, detail="Chyba při vytváření zakázky")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chyba při vytváření zakázky: {str(e)}")

@api_router.put("/users/{user_id}/zakazky/{zakazka_id}")
async def update_zakazka(user_id: str, zakazka_id: str, zakazka: ZakazkaUpdate):
    """Aktualizace zakázky"""
    try:
        # Filtrujeme pouze hodnoty, které nejsou None
        update_data = {k: v for k, v in zakazka.dict().items() if v is not None}
        
        success = await firebase_service.update_zakazka(user_id, zakazka_id, update_data)
        if success:
            return {"message": "Zakázka úspěšně aktualizována"}
        else:
            raise HTTPException(status_code=500, detail="Chyba při aktualizaci zakázky")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chyba při aktualizaci zakázky: {str(e)}")

@api_router.delete("/users/{user_id}/zakazky/{zakazka_id}")
async def delete_zakazka(user_id: str, zakazka_id: str):
    """Smazání zakázky"""
    try:
        success = await firebase_service.delete_zakazka(user_id, zakazka_id)
        if success:
            return {"message": "Zakázka úspěšně smazána"}
        else:
            raise HTTPException(status_code=500, detail="Chyba při mazání zakázky")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chyba při mazání zakázky: {str(e)}")

@api_router.get("/users/{user_id}")
async def get_user_data(user_id: str):
    """Získání všech dat uživatele"""
    try:
        user_data = await firebase_service.get_user_data(user_id)
        if user_data:
            return user_data
        else:
            raise HTTPException(status_code=404, detail="Uživatel nenalezen")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chyba při načítání uživatele: {str(e)}")

@api_router.post("/users/{user_id}")
async def create_or_update_user_data(user_id: str, data: Dict[str, Any]):
    """Vytvoření nebo aktualizace uživatelských dat"""
    try:
        success = await firebase_service.create_user_data(user_id, data)
        if success:
            return {"message": "Uživatelská data úspěšně uložena"}
        else:
            raise HTTPException(status_code=500, detail="Chyba při ukládání dat")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chyba při ukládání dat: {str(e)}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🔥 Firebase server spuštěn")
    logger.info("✅ Dušan - Správa zakázek API připraveno")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🔥 Firebase server zastaven")
