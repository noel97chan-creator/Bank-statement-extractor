from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bank Statement Extractor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./bank_statements.db"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]

    # File upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".PDF"]

    # Supported banks
    SUPPORTED_BANKS: List[str] = [
        "HSBC",
        "Trust",
        "Citibank",
        "SCB",
        "DBS",
        "OCBC",
        "GXS"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
