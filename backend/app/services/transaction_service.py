from datetime import datetime
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.transaction import Transaction, TransactionStatus, TransactionCategory

class TransactionService:
    """Service for managing transactions"""

    def get_transaction(self, db: Session, transaction_id: int) -> Optional[Transaction]:
        """Get a transaction by ID"""
        return db.query(Transaction).filter(Transaction.id == transaction_id).first()

    def get_transactions_by_statement(self, db: Session, statement_id: int) -> List[Transaction]:
        """Get all transactions for a statement"""
        return db.query(Transaction).filter(Transaction.statement_id == statement_id).all()

    def update_transaction(self, db: Session, transaction_id: int, updates: Dict) -> Optional[Transaction]:
        """Update a transaction"""
        transaction = self.get_transaction(db, transaction_id)
        if not transaction:
            return None

        # Store original values if this is the first edit
        if not transaction.original_description:
            transaction.original_description = transaction.description
            transaction.original_amount = transaction.amount

        # Update fields
        for key, value in updates.items():
            if hasattr(transaction, key):
                setattr(transaction, key, value)

        transaction.status = TransactionStatus.EDITED
        transaction.edited_at = datetime.utcnow()
        transaction.auto_categorized = False

        db.commit()
        db.refresh(transaction)
        return transaction

    def approve_transaction(self, db: Session, transaction_id: int) -> Optional[Transaction]:
        """Approve a transaction"""
        transaction = self.get_transaction(db, transaction_id)
        if not transaction:
            return None

        transaction.status = TransactionStatus.APPROVED
        transaction.reviewed_at = datetime.utcnow()
        db.commit()
        db.refresh(transaction)
        return transaction

    def reject_transaction(self, db: Session, transaction_id: int) -> Optional[Transaction]:
        """Reject a transaction"""
        transaction = self.get_transaction(db, transaction_id)
        if not transaction:
            return None

        transaction.status = TransactionStatus.REJECTED
        transaction.reviewed_at = datetime.utcnow()
        db.commit()
        db.refresh(transaction)
        return transaction

    def bulk_approve(self, db: Session, transaction_ids: List[int]) -> int:
        """Approve multiple transactions"""
        count = db.query(Transaction).filter(
            Transaction.id.in_(transaction_ids)
        ).update({
            Transaction.status: TransactionStatus.APPROVED,
            Transaction.reviewed_at: datetime.utcnow()
        }, synchronize_session=False)
        db.commit()
        return count

    def get_analytics(self, db: Session, statement_id: Optional[int] = None) -> Dict:
        """Get transaction analytics"""
        query = db.query(Transaction)
        if statement_id:
            query = query.filter(Transaction.statement_id == statement_id)

        transactions = query.all()

        # Calculate analytics
        total_income = sum(t.amount for t in transactions if t.amount > 0)
        total_expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
        net_amount = total_income - total_expenses

        # Category breakdown
        category_breakdown = {}
        for trans in transactions:
            category = trans.category
            if category not in category_breakdown:
                category_breakdown[category] = {
                    "total": 0,
                    "count": 0,
                    "transactions": []
                }
            category_breakdown[category]["total"] += abs(trans.amount)
            category_breakdown[category]["count"] += 1

        # Status breakdown
        status_counts = {
            "pending": len([t for t in transactions if t.status == TransactionStatus.PENDING]),
            "approved": len([t for t in transactions if t.status == TransactionStatus.APPROVED]),
            "rejected": len([t for t in transactions if t.status == TransactionStatus.REJECTED]),
            "edited": len([t for t in transactions if t.status == TransactionStatus.EDITED])
        }

        return {
            "total_transactions": len(transactions),
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_amount": round(net_amount, 2),
            "category_breakdown": category_breakdown,
            "status_breakdown": status_counts
        }

    def get_monthly_summary(self, db: Session, year: int, month: int) -> Dict:
        """Get monthly transaction summary"""
        transactions = db.query(Transaction).filter(
            extract('year', Transaction.transaction_date) == year,
            extract('month', Transaction.transaction_date) == month
        ).all()

        income = sum(t.amount for t in transactions if t.amount > 0)
        expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)

        # Daily breakdown
        daily_breakdown = {}
        for trans in transactions:
            day = trans.transaction_date.day
            if day not in daily_breakdown:
                daily_breakdown[day] = {"income": 0, "expenses": 0, "count": 0}
            if trans.amount > 0:
                daily_breakdown[day]["income"] += trans.amount
            else:
                daily_breakdown[day]["expenses"] += abs(trans.amount)
            daily_breakdown[day]["count"] += 1

        return {
            "year": year,
            "month": month,
            "total_income": round(income, 2),
            "total_expenses": round(expenses, 2),
            "net_amount": round(income - expenses, 2),
            "transaction_count": len(transactions),
            "daily_breakdown": daily_breakdown
        }
