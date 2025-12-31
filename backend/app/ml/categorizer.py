import re
from typing import Tuple
from app.models.transaction import TransactionCategory

class TransactionCategorizer:
    """ML-based transaction categorizer with keyword matching"""

    def __init__(self):
        # Define keyword patterns for each category
        self.category_patterns = {
            TransactionCategory.FOOD_DINING: [
                r'restaurant|cafe|coffee|starbucks|mcdonald|kfc|food|dining|pizza|sushi|burger|grab\s*food|deliveroo|foodpanda',
                r'hawker|kopitiam|toast\s*box|bread\s*talk|ya\s*kun|old\s*chang\s*kee'
            ],
            TransactionCategory.GROCERIES: [
                r'ntuc|fairprice|cold\s*storage|giant|sheng\s*siong|market|supermarket|grocery|fresh|mart'
            ],
            TransactionCategory.TRANSPORT: [
            r'grab|gojek|comfort|taxi|mrt|lta|ezlink|simplygo|parking|petrol|shell|esso|caltex|spc|transit|bus',
                r'smrt|grab|transport|uber|diesel|fuel'
            ],
            TransactionCategory.SHOPPING: [
                r'lazada|shopee|amazon|taobao|qoo10|carousell|uniqlo|h&m|zara|nike|adidas|shopping|retail',
                r'mall|store|boutique|fashion|shoes|clothing|electronics'
            ],
            TransactionCategory.ENTERTAINMENT: [
                r'netflix|spotify|disney|hbo|youtube|cinema|movie|cathay|gv|shaw|concert|ticket|game|steam|playstation',
                r'entertainment|show|theater|ktv|karaoke'
            ],
            TransactionCategory.BILLS_UTILITIES: [
                r'sp\s*group|sp\s*services|utility|electricity|water|gas|phone|mobile|singtel|starhub|m1|internet|broadband',
                r'bill|payment|subscription|membership'
            ],
            TransactionCategory.HEALTHCARE: [
                r'clinic|hospital|doctor|dental|pharmacy|guardian|watsons|medical|health|insurance|aia|prudential',
                r'medicine|drug|prescription'
            ],
            TransactionCategory.INCOME: [
                r'salary|payroll|income|dividend|interest|bonus|commission|refund|reimbursement|deposit',
                r'transfer\s*in|credit|payment\s*received'
            ],
            TransactionCategory.TRANSFER: [
                r'transfer|paynow|paylah|fast\s*payment|giro|interbank|withdrawal\s*atm',
                r'atm\s*withdrawal|cash\s*withdrawal'
            ],
            TransactionCategory.INVESTMENT: [
                r'investment|stock|share|bond|fund|etf|trading|broker|dbs\s*vickers|poems|tiger|moomoo',
                r'crypto|bitcoin|cryptocurrency'
            ],
            TransactionCategory.INSURANCE: [
                r'insurance|aia|prudential|great\s*eastern|aviva|manulife|tokio\s*marine|premium|policy'
            ],
            TransactionCategory.EDUCATION: [
                r'school|university|college|tuition|course|udemy|coursera|education|training|book|bookstore'
            ],
            TransactionCategory.TRAVEL: [
                r'hotel|airbnb|agoda|booking\.com|flight|airline|scoot|jetstar|sia|travel|tour|vacation',
                r'airport|baggage|immigration'
            ],
            TransactionCategory.PERSONAL_CARE: [
                r'salon|spa|barber|haircut|massage|gym|fitness|yoga|beauty|cosmetic|skincare'
            ],
            TransactionCategory.LOAN_PAYMENT: [
                r'loan|mortgage|instalment|installment|repayment|emi|housing\s*loan|car\s*loan'
            ]
        }

    def categorize(self, description: str, amount: float = 0.0) -> Tuple[TransactionCategory, float]:
        """
        Categorize a transaction based on description and amount
        Returns: (category, confidence_score)
        """
        description_lower = description.lower()

        # Check for income patterns (positive amounts usually)
        if amount > 0:
            if any(re.search(pattern, description_lower) for pattern in self.category_patterns[TransactionCategory.INCOME]):
                return TransactionCategory.INCOME, 0.95

        # Check each category
        for category, patterns in self.category_patterns.items():
            for pattern in patterns:
                if re.search(pattern, description_lower):
                    # Calculate confidence based on pattern match strength
                    confidence = 0.85 if len(pattern) > 20 else 0.75
                    return category, confidence

        # Default to OTHER if no match found
        return TransactionCategory.OTHER, 0.3

    def batch_categorize(self, transactions: list) -> list:
        """Categorize a batch of transactions"""
        results = []
        for trans in transactions:
            category, confidence = self.categorize(
                trans.get('description', ''),
                trans.get('amount', 0.0)
            )
            results.append({
                **trans,
                'category': category,
                'confidence_score': confidence,
                'auto_categorized': True
            })
        return results
