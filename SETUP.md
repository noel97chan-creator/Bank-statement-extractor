# Quick Setup Guide

## 1. Backend Setup

### Install Dependencies
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### Run Backend
```bash
# Option 1: Using uvicorn directly
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using the run script
python backend/run.py
```

Backend will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 2. Frontend Setup

### Install Dependencies
```bash
cd frontend
npm install
```

### Configure Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Run Frontend
```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

## 3. First Use

1. Open http://localhost:3000 in your browser
2. Click "Upload" tab
3. Drag and drop a bank statement PDF
4. Wait for processing
5. View results in Dashboard, Transactions, or Calendar tabs

## Supported Bank Statement Formats

- HSBC Singapore
- DBS/POSB Singapore
- OCBC Singapore
- Citibank Singapore
- Standard Chartered Bank (SCB) Singapore
- Trust Bank Singapore
- GXS Bank Singapore

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.10+)
- Install missing dependencies: `pip install -r requirements.txt`
- Check port 8000 is not in use

### Frontend won't start
- Check Node version: `node --version` (should be 18+)
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check port 3000 is not in use

### PDF not processing
- Ensure PDF is from a supported bank
- Check PDF is not password-protected
- Verify PDF contains text (not scanned image)
- Check backend logs for errors

### Can't connect to API
- Verify backend is running on port 8000
- Check `frontend/.env.local` has correct API URL
- Clear browser cache

## Development Tips

### Backend Development
- API docs available at http://localhost:8000/docs
- Use `--reload` flag for hot reloading
- Check logs in terminal for errors

### Frontend Development
- Uses Next.js App Router
- Tailwind CSS for styling
- TypeScript for type safety
- Hot reloading enabled by default

### Database
- SQLite database created automatically
- Located at `backend/bank_statements.db`
- To reset: delete the database file and restart

## Production Deployment

### Backend
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with production settings
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Security Checklist for Production

- [ ] Enable HTTPS
- [ ] Add authentication
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use strong database passwords
- [ ] Enable file upload validation
- [ ] Set up monitoring and logging
- [ ] Configure backup system
- [ ] Use environment variables for secrets
- [ ] Enable security headers
