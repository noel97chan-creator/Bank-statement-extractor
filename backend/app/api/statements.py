import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.config import settings
from app.services.statement_service import StatementService
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()
statement_service = StatementService()

# Pydantic models for responses
class StatementResponse(BaseModel):
    id: int
    filename: str
    bank_name: str
    account_number: str | None
    statement_period_start: datetime | None
    statement_period_end: datetime | None
    uploaded_at: datetime
    status: str

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    success: bool
    message: str
    statement_id: int | None = None
    bank_name: str | None = None
    transaction_count: int | None = None

@router.post("/upload", response_model=UploadResponse)
async def upload_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process a bank statement PDF"""

    # Validate file type
    if not file.filename.endswith(('.pdf', '.PDF')):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Create uploads directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Save uploaded file
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Process the statement
    result = statement_service.process_statement(db, file_path, file.filename)

    if "error" in result:
        # Clean up file if processing failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=result["error"])

    return UploadResponse(
        success=True,
        message="Statement processed successfully",
        statement_id=result["statement_id"],
        bank_name=result["bank_name"],
        transaction_count=result["transaction_count"]
    )

@router.get("/", response_model=List[StatementResponse])
async def get_statements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all uploaded statements"""
    statements = statement_service.get_all_statements(db, skip, limit)
    return statements

@router.get("/{statement_id}", response_model=StatementResponse)
async def get_statement(
    statement_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific statement"""
    statement = statement_service.get_statement(db, statement_id)
    if not statement:
        raise HTTPException(status_code=404, detail="Statement not found")
    return statement

@router.delete("/{statement_id}")
async def delete_statement(
    statement_id: int,
    db: Session = Depends(get_db)
):
    """Delete a statement and all its transactions"""
    success = statement_service.delete_statement(db, statement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Statement not found")
    return {"message": "Statement deleted successfully"}

@router.get("/banks/supported")
async def get_supported_banks():
    """Get list of supported banks"""
    return {
        "banks": settings.SUPPORTED_BANKS,
        "count": len(settings.SUPPORTED_BANKS)
    }
