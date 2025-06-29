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

# Firebase service (s fallback na Supabase)
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
    return {"message": "Dušan - Správa zakázek API", "status": "running", "database": "supabase"}

# Status check endpoints (pro testování)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    # Jednoduché API bez databáze - vše řeší frontend přes Supabase
    return status_obj

@api_router.get("/status")
async def get_status_checks():
    return {"message": "Status checks - Supabase API", "timestamp": datetime.utcnow()}

# Základní API endpointy - skutečná data se spravují ve frontendu přes Supabase
@api_router.get("/users/{user_id}/zakazky")
async def get_user_zakazky(user_id: str):
    """API pro kompatibilitu - skutečná data spravuje frontend přes Supabase"""
    return {"message": "Zakázky se spravují přes Supabase na frontendu", "user_id": user_id}

@api_router.post("/users/{user_id}/zakazky")
async def create_zakazka(user_id: str, zakazka: ZakazkaCreate):
    """API pro kompatibilitu - skutečná data spravuje frontend přes Supabase"""
    return {"message": "Zakázka se vytvoří přes Supabase na frontendu", "user_id": user_id}

@api_router.put("/users/{user_id}/zakazky/{zakazka_id}")
async def update_zakazka(user_id: str, zakazka_id: str, zakazka: ZakazkaUpdate):
    """API pro kompatibilitu - skutečná data spravuje frontend přes Supabase"""
    return {"message": "Zakázka se aktualizuje přes Supabase na frontendu", "user_id": user_id, "zakazka_id": zakazka_id}

@api_router.delete("/users/{user_id}/zakazky/{zakazka_id}")
async def delete_zakazka(user_id: str, zakazka_id: str):
    """API pro kompatibilitu - skutečná data spravuje frontend přes Supabase"""
    return {"message": "Zakázka se smaže přes Supabase na frontendu", "user_id": user_id, "zakazka_id": zakazka_id}

@api_router.get("/users/{user_id}")
async def get_user_data(user_id: str):
    """API pro kompatibilitu - skutečná data spravuje frontend přes Supabase"""
    return {"message": "Uživatelská data se spravují přes Supabase na frontendu", "user_id": user_id}

@api_router.post("/users/{user_id}")
async def create_or_update_user_data(user_id: str, data: Dict[str, Any]):
    """API pro kompatibilitu - skutečná data spravuje frontend přes Supabase"""
    return {"message": "Uživatelská data se ukládají přes Supabase na frontendu", "user_id": user_id}


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
    logger.info("🔥 Supabase server spuštěn")
    logger.info("✅ Dušan - Správa zakázek API připraveno")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🔥 Supabase server zastaven")
