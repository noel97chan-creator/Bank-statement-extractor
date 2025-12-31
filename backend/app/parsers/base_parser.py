from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import pdfplumber
import re
from datetime import datetime
import dateparser

class BaseParser(ABC):
    """Base class for all bank statement parsers"""

    def __init__(self):
        self.bank_name = ""
        self.account_number = None
        self.period_start = None
        self.period_end = None
        self.transactions = []

    @abstractmethod
    def detect_bank(self, text: str) -> bool:
        """Detect if the PDF is from this bank"""
        pass

    @abstractmethod
    def extract_account_info(self, text: str) -> Dict:
        """Extract account information"""
        pass

    @abstractmethod
    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from PDF"""
        pass

    def parse(self, pdf_path: str) -> Dict:
        """Main parsing method"""
        with pdfplumber.open(pdf_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() or ""

            # Detect bank
            if not self.detect_bank(full_text):
                return None

            # Extract account info
            account_info = self.extract_account_info(full_text)

            # Extract transactions
            transactions = self.extract_transactions(pdf_path)

            return {
                "bank_name": self.bank_name,
                "account_number": account_info.get("account_number"),
                "period_start": account_info.get("period_start"),
                "period_end": account_info.get("period_end"),
                "transactions": transactions
            }

    def clean_amount(self, amount_str: str) -> float:
        """Clean and convert amount string to float"""
        if not amount_str:
            return 0.0
        # Remove currency symbols and spaces
        cleaned = re.sub(r'[SGD$,\s]', '', amount_str)
        # Handle negative amounts in parentheses
        if '(' in cleaned and ')' in cleaned:
            cleaned = '-' + cleaned.replace('(', '').replace(')', '')
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    def parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime object"""
        if not date_str:
            return None
        try:
            parsed_date = dateparser.parse(date_str)
            return parsed_date
        except:
            return None
