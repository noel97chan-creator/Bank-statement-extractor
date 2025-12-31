# ⚡ Quick Start Guide

## ✅ Dependencies Already Installed!

Your virtual environment is ready with all backend dependencies installed.

---

## 🚀 How to Run

### Option 1: Using the startup scripts (EASIEST)

**Terminal 1 - Backend:**
```bash
cd /home/user/Bank-statement-extractor
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/Bank-statement-extractor
./start-frontend.sh
```

### Option 2: Manual commands

**Terminal 1 - Backend:**
```bash
cd /home/user/Bank-statement-extractor
source venv/bin/activate
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/Bank-statement-extractor/frontend
npm install  # Only needed first time
npm run dev
```

---

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📋 What's Working

✅ Python virtual environment created
✅ All backend dependencies installed
✅ Backend tested and working
✅ Ready to install frontend dependencies

---

## 🔧 Next Steps

1. **Start the backend** (use one of the options above)
2. **Open a new terminal** and start the frontend
3. **Open your browser** to http://localhost:3000
4. **Upload a bank statement PDF** and start analyzing!

---

## ❓ Troubleshooting

**If backend won't start:**
```bash
cd /home/user/Bank-statement-extractor
source venv/bin/activate
cd backend
python -c "from app.main import app; print('OK')"
```

**If frontend needs dependencies:**
```bash
cd /home/user/Bank-statement-extractor/frontend
npm install
```

---

## 📁 Project Location

```
/home/user/Bank-statement-extractor/
```

Everything is ready to go! 🎉
