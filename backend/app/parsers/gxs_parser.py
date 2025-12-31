import re
import pdfplumber
from typing import List, Dict
from .base_parser import BaseParser

class GXSParser(BaseParser):
    """Parser for GXS Bank statements"""

    def __init__(self):
        super().__init__()
        self.bank_name = "GXS"

    def detect_bank(self, text: str) -> bool:
        """Detect if this is a GXS Bank statement"""
        return "GXS BANK" in text.upper() or "GXS" in text.upper()

    def extract_account_info(self, text: str) -> Dict:
        """Extract account information from GXS Bank statement"""
        info = {}

        # Account number pattern
        account_match = re.search(r'Account\s*(?:Number|No\.?)[\s:]*(\d{10,12})', text, re.IGNORECASE)
        if account_match:
            info["account_number"] = account_match.group(1)

        # Statement period pattern
        period_match = re.search(r'(?:Statement\s+Period|Period|From)[\s:]*(\d{1,2}\s+\w+\s+\d{4})\s*(?:to|-|To)\s*(\d{1,2}\s+\w+\s+\d{4})', text, re.IGNORECASE)
        if period_match:
            info["period_start"] = self.parse_date(period_match.group(1))
            info["period_end"] = self.parse_date(period_match.group(2))

        return info

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from GXS Bank statement"""
        transactions = []

        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()

                for table in tables:
                    if not table:
                        continue

                    for row in table:
                        if not row or len(row) < 3:
                            continue

                        # Skip header rows
                        if any(header in str(row).upper() for header in ["DATE", "DESCRIPTION", "TRANSACTION", "BALANCE"]):
                            continue

                        # GXS format: Date | Description | Amount | Balance
                        try:
                            date_str = row[0] if row[0] else ""
                            description = row[1] if len(row) > 1 and row[1] else ""
                            amount_str = row[2] if len(row) > 2 and row[2] else ""
                            balance = row[3] if len(row) > 3 and row[3] else ""

                            if not date_str or not description:
                                continue

                            transaction_date = self.parse_date(date_str)
                            if not transaction_date:
                                continue

                            amount = self.clean_amount(amount_str) if amount_str else 0.0
                            balance_amount = self.clean_amount(balance) if balance else None

                            transactions.append({
                                "date": transaction_date,
                                "description": description.strip(),
                                "amount": amount,
                                "balance": balance_amount
                            })
                        except Exception as e:
                            continue

        return transactions
