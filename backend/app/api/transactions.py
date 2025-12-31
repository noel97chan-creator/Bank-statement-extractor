from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.services.transaction_service import TransactionService

router = APIRouter()
transaction_service = TransactionService()

# Pydantic models
class TransactionResponse(BaseModel):
    id: int
    statement_id: int
    transaction_date: datetime
    description: str
    amount: float
    balance: float | None
    category: str
    confidence_score: float
    status: str
    auto_categorized: bool
    edited_at: datetime | None
    reviewed_at: datetime | None
    original_description: str | None
    original_amount: float | None

    class Config:
        from_attributes = True

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None

class BulkApproveRequest(BaseModel):
    transaction_ids: List[int]

@router.get("/statement/{statement_id}", response_model=List[TransactionResponse])
async def get_transactions_by_statement(
    statement_id: int,
    db: Session = Depends(get_db)
):
    """Get all transactions for a specific statement"""
    transactions = transaction_service.get_transactions_by_statement(db, statement_id)
    return transactions

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific transaction"""
    transaction = transaction_service.get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    updates: TransactionUpdate,
    db: Session = Depends(get_db)
):
    """Update a transaction"""
    update_dict = updates.model_dump(exclude_unset=True)
    transaction = transaction_service.update_transaction(db, transaction_id, update_dict)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/{transaction_id}/approve", response_model=TransactionResponse)
async def approve_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Approve a transaction"""
    transaction = transaction_service.approve_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/{transaction_id}/reject", response_model=TransactionResponse)
async def reject_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Reject a transaction"""
    transaction = transaction_service.reject_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/bulk-approve")
async def bulk_approve_transactions(
    request: BulkApproveRequest,
    db: Session = Depends(get_db)
):
    """Approve multiple transactions at once"""
    count = transaction_service.bulk_approve(db, request.transaction_ids)
    return {"message": f"{count} transactions approved", "count": count}
