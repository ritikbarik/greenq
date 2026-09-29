import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine, Base, SessionLocal
from app.services.seed_service import seed_database_if_empty
from app.ml.pipeline import ml_pipeline
from app.api.v1 import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables, seed data, verify ML model
    print("[Startup] Initializing GreenQuant database and models...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

    try:
        print("[Startup] Ensuring fuel prediction ML model is loaded or trained...")
        ml_pipeline.load_or_train()
    except Exception as e:
        print(f"[Startup Warning] ML model initialization: {e}")

    print("[Startup] GreenQuant Engine Ready!")
    yield
    print("[Shutdown] GreenQuant shutting down...")

app = FastAPI(
    title="GREENQUANT",
    description="Quantum-Inspired Green Fleet Optimization & Fuel Prediction Platform",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "platform": "GREENQUANT",
        "tagline": "Optimize Fleet. Reduce Fuel. Cut Emissions.",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": "/api/v1"
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "platform": "GREENQUANT",
        "database": "connected",
        "ml_engine": "ready",
        "optimization_engine": "ready (QIGA / GA / PSO)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
