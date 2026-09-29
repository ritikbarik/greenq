import os

class Settings:
    PROJECT_NAME: str = "GREENQUANT"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database (Default SQLite for local portability, supports PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/greenquant.db")
    
    # ML model and dataset paths
    DATA_DIR: str = os.getenv("DATA_DIR", "./data")
    MODEL_FILE: str = os.path.join(DATA_DIR, "fuel_model.joblib")
    DATASET_FILE: str = os.path.join(DATA_DIR, "maritime_synthetic_fuel_dataset.csv")
    
    # Optimization defaults
    DEFAULT_RANDOM_SEED: int = 42
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

settings = Settings()
