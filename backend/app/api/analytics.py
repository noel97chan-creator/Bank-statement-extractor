from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.services.transaction_service import TransactionService

router = APIRouter()
transaction_service = TransactionService()

@router.get("/")
async def get_analytics(
    statement_id: Optional[int] = Query(None, description="Filter by statement ID"),
    db: Session = Depends(get_db)
):
    """Get transaction analytics"""
    analytics = transaction_service.get_analytics(db, statement_id)
    return analytics

@router.get("/monthly/{year}/{month}")
async def get_monthly_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """Get monthly transaction summary"""
    if month < 1 or month > 12:
        return {"error": "Month must be between 1 and 12"}
    summary = transaction_service.get_monthly_summary(db, year, month)
    return summary
