# Bank Statement Extractor

A comprehensive AI-powered bank statement extraction and analysis platform for Singapore banks. Features modern UI/UX inspired by Binance and Ultrathink, with automatic transaction categorization, detailed analytics, calendar view, and transaction review/approval system.

## Features

### Core Features
- **Multi-Bank Support**: HSBC, DBS, OCBC, Citibank, Standard Chartered (SCB), Trust Bank, and GXS Bank
- **Automatic PDF Extraction**: Intelligent parsing of bank statement PDFs
- **AI-Powered Categorization**: Automatic categorization of transactions into 16+ categories
- **Transaction Review System**: Edit, approve, or reject transactions
- **Real-time Analytics**: Comprehensive dashboards with charts and insights
- **Calendar View**: Visual calendar showing daily transactions
- **Modern UI/UX**: Dark-themed, responsive design inspired by Binance

### Transaction Categories
- Food & Dining
- Shopping
- Transport
- Entertainment
- Bills & Utilities
- Healthcare
- Income
- Transfer
- Investment
- Loan Payment
- Insurance
- Education
- Travel
- Personal Care
- Groceries
- Other

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **pdfplumber**: PDF text extraction
- **SQLite**: Database (easily switchable to PostgreSQL)
- **Python 3.10+**

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library
- **React Calendar**: Calendar component
- **Lucide React**: Icon library

## Quick Start

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. Run the backend server:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### Uploading Bank Statements

1. Click on the "Upload" tab
2. Drag and drop your bank statement PDF or click to browse
3. The system will automatically:
   - Detect the bank
   - Extract all transactions
   - Categorize each transaction
   - Display results in the dashboard

### Reviewing Transactions

1. Go to the "Transactions" tab
2. Use filters to find specific transactions
3. Edit, approve, or reject transactions
4. Use "Approve All Pending" for bulk approval

### Viewing Analytics

Navigate to the "Dashboard" tab to view:
- Total income, expenses, and net amount
- Category breakdown charts
- Transaction status summary

### Calendar View

Click on the "Calendar" tab to view transactions by date with daily totals.

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
Bank-statement-extractor/
├── backend/
│   └── app/
│       ├── api/              # API endpoints
│       ├── core/             # Core configurations
│       ├── models/           # Database models
│       ├── parsers/          # Bank-specific parsers
│       ├── ml/               # ML categorization
│       └── services/         # Business logic
├── frontend/
│   └── src/
│       ├── app/              # Next.js pages
│       ├── components/       # React components
│       ├── lib/              # Utilities and API client
│       ├── types/            # TypeScript types
│       └── styles/           # CSS styles
└── requirements.txt          # Python dependencies
```

## Supported Banks

- HSBC Singapore
- DBS/POSB Singapore
- OCBC Singapore
- Citibank Singapore
- Standard Chartered Bank (SCB) Singapore
- Trust Bank Singapore
- GXS Bank Singapore

## Screenshots

### Dashboard
Modern analytics dashboard with income/expense tracking and category breakdown

### Transactions
Comprehensive transaction list with filtering, sorting, and editing capabilities

### Calendar View
Visual calendar showing daily transactions and totals

## Security Considerations

- Store uploaded statements securely
- Implement authentication for production use
- Use HTTPS in production
- Sanitize file uploads
- Add rate limiting

## Future Enhancements

- Multi-user support with authentication
- Export transactions to Excel/CSV
- Integration with accounting software
- Mobile app support
- Budget tracking and alerts
- Multi-currency support

## License

MIT License

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## Support

For issues and feature requests, please create an issue in the repository.