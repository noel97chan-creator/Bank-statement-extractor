import re
import pdfplumber
from typing import List, Dict
from .base_parser import BaseParser

class DBSParser(BaseParser):
    """Parser for DBS bank statements"""

    def __init__(self):
        super().__init__()
        self.bank_name = "DBS"

    def detect_bank(self, text: str) -> bool:
        """Detect if this is a DBS statement"""
        return "DBS BANK" in text.upper() or "DBS LTD" in text.upper()

    def extract_account_info(self, text: str) -> Dict:
        """Extract account information from DBS statement"""
        info = {}

        # Account number pattern
        account_match = re.search(r'Account\s*(?:Number|No\.?)[\s:]*(\d{3}[-\s]?\d{1,6}[-\s]?\d{1})', text, re.IGNORECASE)
        if account_match:
            info["account_number"] = account_match.group(1).replace(" ", "").replace("-", "")

        # Statement period pattern
        period_match = re.search(r'(?:Statement\s+Period|From)[\s:]*(\d{1,2}\s+\w+\s+\d{4})\s*(?:to|-|To)\s*(\d{1,2}\s+\w+\s+\d{4})', text, re.IGNORECASE)
        if period_match:
            info["period_start"] = self.parse_date(period_match.group(1))
            info["period_end"] = self.parse_date(period_match.group(2))

        return info

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from DBS statement"""
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
                        if any(header in str(row).upper() for header in ["DATE", "DESCRIPTION", "TRANSACTION", "BALANCE", "WITHDRAWAL", "DEPOSIT"]):
                            continue

                        # DBS format: Date | Description | Withdrawal | Deposit | Balance
                        try:
                            date_str = row[0] if row[0] else ""
                            description = row[1] if len(row) > 1 and row[1] else ""

                            if not date_str or not description:
                                continue

                            transaction_date = self.parse_date(date_str)
                            if not transaction_date:
                                continue

                            # Find amount columns
                            withdrawal = ""
                            deposit = ""
                            balance = ""

                            if len(row) >= 4:
                                withdrawal = row[2] if row[2] else ""
                                deposit = row[3] if row[3] else ""
                                balance = row[4] if len(row) > 4 and row[4] else ""
                            elif len(row) == 3:
                                # Sometimes amount and balance only
                                amount_col = row[2] if row[2] else ""
                                if amount_col:
                                    if "-" in amount_col or "(" in amount_col:
                                        withdrawal = amount_col
                                    else:
                                        deposit = amount_col

                            # Determine amount
                            amount = 0.0
                            if withdrawal and withdrawal.strip():
                                amount = -abs(self.clean_amount(withdrawal))
                            elif deposit and deposit.strip():
                                amount = abs(self.clean_amount(deposit))

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
