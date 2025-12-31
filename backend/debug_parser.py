"""
Debug script to test PDF parsing
Usage: python debug_parser.py <path_to_pdf>
"""
import sys
import pdfplumber
from app.parsers import BANK_PARSERS

def debug_pdf(pdf_path):
    print(f"=== Analyzing PDF: {pdf_path} ===\n")

    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Total pages: {len(pdf.pages)}\n")

            # Extract text from first page
            first_page = pdf.pages[0]
            text = first_page.extract_text()

            print("=== FIRST PAGE TEXT (first 1000 chars) ===")
            print(text[:1000])
            print("\n")

            # Try to detect bank
            print("=== BANK DETECTION ===")
            for bank_name, parser_class in BANK_PARSERS.items():
                parser = parser_class()
                if parser.detect_bank(text):
                    print(f"✓ Detected as: {bank_name}")

                    # Try to parse
                    print(f"\n=== PARSING WITH {bank_name} PARSER ===")
                    result = parser.parse(pdf_path)

                    if result:
                        print(f"Account: {result.get('account_number')}")
                        print(f"Period: {result.get('period_start')} to {result.get('period_end')}")
                        print(f"Transactions found: {len(result.get('transactions', []))}")

                        if result.get('transactions'):
                            print("\n=== FIRST 3 TRANSACTIONS ===")
                            for trans in result['transactions'][:3]:
                                print(f"  Date: {trans['date']}")
                                print(f"  Desc: {trans['description']}")
                                print(f"  Amount: {trans['amount']}")
                                print(f"  Balance: {trans.get('balance')}")
                                print()
                    else:
                        print("❌ Parsing returned None")

                    return

            print("❌ No bank detected")

            # Show tables
            print("\n=== TABLES ON FIRST PAGE ===")
            tables = first_page.extract_tables()
            print(f"Found {len(tables)} tables")

            if tables:
                print("\n=== FIRST TABLE (first 5 rows) ===")
                for i, row in enumerate(tables[0][:5]):
                    print(f"Row {i}: {row}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_parser.py <path_to_pdf>")
        sys.exit(1)

    debug_pdf(sys.argv[1])
