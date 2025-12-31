from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EDITED = "edited"

class TransactionCategory(str, enum.Enum):
    FOOD_DINING = "Food & Dining"
    SHOPPING = "Shopping"
    TRANSPORT = "Transport"
    ENTERTAINMENT = "Entertainment"
    BILLS_UTILITIES = "Bills & Utilities"
    HEALTHCARE = "Healthcare"
    INCOME = "Income"
    TRANSFER = "Transfer"
    INVESTMENT = "Investment"
    LOAN_PAYMENT = "Loan Payment"
    INSURANCE = "Insurance"
    EDUCATION = "Education"
    TRAVEL = "Travel"
    PERSONAL_CARE = "Personal Care"
    GROCERIES = "Groceries"
    OTHER = "Other"

class Statement(Base):
    __tablename__ = "statements"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    bank_name = Column(String, nullable=False)
    account_number = Column(String)
    statement_period_start = Column(DateTime)
    statement_period_end = Column(DateTime)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)
    status = Column(String, default="processing")

    transactions = relationship("Transaction", back_populates="statement", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    statement_id = Column(Integer, ForeignKey("statements.id"), nullable=False)

    transaction_date = Column(DateTime, nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    balance = Column(Float)
    reference = Column(String)

    # Categorization
    category = Column(String, default=TransactionCategory.OTHER)
    auto_categorized = Column(Boolean, default=True)
    confidence_score = Column(Float, default=0.0)

    # Review & Approval
    status = Column(String, default=TransactionStatus.PENDING)
    reviewed_at = Column(DateTime)
    edited_at = Column(DateTime)
    original_description = Column(Text)
    original_amount = Column(Float)

    # Relations
    statement = relationship("Statement", back_populates="transactions")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
