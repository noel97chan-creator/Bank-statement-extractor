#!/bin/bash
# Activate virtual environment and start backend

cd "$(dirname "$0")"
source venv/bin/activate
cd backend
echo "🚀 Starting Backend Server on http://localhost:8000"
echo "📚 API Docs will be at http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
