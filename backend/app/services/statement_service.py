import os
from datetime import datetime
from typing import Optional, Dict
from sqlalchemy.orm import Session
from app.models.transaction import Statement, Transaction
from app.parsers import get_parser, BANK_PARSERS
from app.ml.categorizer import TransactionCategorizer

class StatementService:
    """Service for processing bank statements"""

    def __init__(self):
        self.categorizer = TransactionCategorizer()

    def detect_bank(self, pdf_path: str) -> Optional[str]:
        """Detect which bank the statement is from"""
        # Try each parser to detect the bank
        for bank_name, parser_class in BANK_PARSERS.items():
            parser = parser_class()
            try:
                with open(pdf_path, 'rb'):
                    import pdfplumber
                    with pdfplumber.open(pdf_path) as pdf:
                        text = ""
                        for page in pdf.pages[:2]:  # Check first 2 pages only
                            text += page.extract_text() or ""
                        if parser.detect_bank(text):
                            return bank_name
            except Exception as e:
                continue
        return None

    def process_statement(self, db: Session, pdf_path: str, filename: str) -> Dict:
        """Process a bank statement PDF"""
        # Detect bank
        bank_name = self.detect_bank(pdf_path)
        if not bank_name:
            return {"error": "Unable to detect bank. Supported banks: HSBC, DBS, OCBC, Citibank, SCB, Trust, GXS"}

        # Get appropriate parser
        parser = get_parser(bank_name)
        if not parser:
            return {"error": f"Parser not found for {bank_name}"}

        # Parse the PDF
        try:
            parsed_data = parser.parse(pdf_path)
            if not parsed_data:
                return {"error": "Failed to parse statement"}

            # Create statement record
            statement = Statement(
                filename=filename,
                bank_name=bank_name,
                account_number=parsed_data.get("account_number"),
                statement_period_start=parsed_data.get("period_start"),
                statement_period_end=parsed_data.get("period_end"),
                processed_at=datetime.utcnow(),
                status="completed"
            )
            db.add(statement)
            db.flush()

            # Categorize and save transactions
            transactions_data = parsed_data.get("transactions", [])
            categorized_transactions = self.categorizer.batch_categorize(transactions_data)

            for trans_data in categorized_transactions:
                transaction = Transaction(
                    statement_id=statement.id,
                    transaction_date=trans_data["date"],
                    description=trans_data["description"],
                    amount=trans_data["amount"],
                    balance=trans_data.get("balance"),
                    category=trans_data["category"],
                    confidence_score=trans_data["confidence_score"],
                    auto_categorized=trans_data["auto_categorized"]
                )
                db.add(transaction)

            db.commit()
            db.refresh(statement)

            return {
                "success": True,
                "statement_id": statement.id,
                "bank_name": bank_name,
                "account_number": statement.account_number,
                "period_start": statement.statement_period_start,
                "period_end": statement.statement_period_end,
                "transaction_count": len(categorized_transactions)
            }

        except Exception as e:
            db.rollback()
            return {"error": f"Error processing statement: {str(e)}"}

    def get_statement(self, db: Session, statement_id: int) -> Optional[Statement]:
        """Get a statement by ID"""
        return db.query(Statement).filter(Statement.id == statement_id).first()

    def get_all_statements(self, db: Session, skip: int = 0, limit: int = 100):
        """Get all statements"""
        return db.query(Statement).offset(skip).limit(limit).all()

    def delete_statement(self, db: Session, statement_id: int) -> bool:
        """Delete a statement and its transactions"""
        statement = self.get_statement(db, statement_id)
        if statement:
            db.delete(statement)
            db.commit()
            return True
        return False
