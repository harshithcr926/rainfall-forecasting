# 🌧️ RainCast AI — AI-Driven Rainfall Forecasting System
### 2nd Year Engineering Mini Project

---

## 📋 Project Overview

An end-to-end AI-powered rainfall prediction system that:
- Uploads and preprocesses weather datasets
- Performs Exploratory Data Analysis (EDA)
- Trains and compares multiple ML models
- Implements a deep learning ANN (TensorFlow/Keras)
- Demonstrates Q-Learning based RL optimization
- Provides a real-time rainfall prediction interface
- Displays results on an interactive dashboard

---

## 🗂️ Project Structure

```
rainfall-forecasting/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx            # Main app with all pages/components
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json            # Vercel deployment config
│   └── .env.example
│
├── backend/                   # Flask Python backend
│   ├── app.py                 # Main Flask app
│   ├── requirements.txt       # Python dependencies
│   ├── render.yaml            # Render deployment config
│   └── routes/
│       ├── dataset_routes.py  # CSV upload & preprocessing
│       ├── eda_routes.py      # Exploratory data analysis
│       ├── ml_routes.py       # ML model training
│       ├── dl_routes.py       # Deep learning (ANN)
│       ├── rl_routes.py       # RL Q-learning demo
│       └── predict_routes.py  # Rainfall prediction
│
└── data/
    └── sample_weather.csv     # Sample dataset for testing
```

---

## ⚙️ Local Setup

### Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# API runs at: http://localhost:5000
```

### Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local: VITE_API_URL=http://localhost:5000
npm run dev
# App runs at: http://localhost:5173
```

---

## 🚀 Deployment

### Deploy Backend → Render (Free Tier)

1. Push `backend/` folder to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`
5. Deploy → Get your URL: `https://your-app.onrender.com`

### Deploy Frontend → Vercel (Free Tier)

1. Push `frontend/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-app.onrender.com`
4. Deploy → Get your URL: `https://your-app.vercel.app`

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Charts | Recharts | Data visualization |
| Backend | Flask (Python) | REST API |
| ML | Scikit-learn | ML models |
| DL | TensorFlow/Keras | ANN model |
| RL | NumPy | Q-learning demo |
| Deployment | Vercel + Render | Free cloud hosting |

---

## 🤖 ML Models Implemented

| Model | Type | Purpose |
|-------|------|---------|
| Linear Regression | Regression | Baseline prediction |
| Decision Tree | Tree-based | Non-linear patterns |
| Random Forest | Ensemble | Robust prediction |
| XGBoost | Gradient Boost | High accuracy |
| ANN (TensorFlow) | Deep Learning | Neural network |
| Q-Learning | Reinforcement Learning | Optimization demo |

---

## 📊 Features

1. **Dataset Upload** — CSV upload with auto preprocessing
2. **EDA** — 5 chart types: trend, scatter, bar, heatmap, seasonal
3. **ML Training** — Train 4 models, compare accuracy/RMSE/MAE/R²
4. **Deep Learning** — ANN with loss curve and prediction comparison
5. **RL Demo** — Q-learning reward curve and optimization steps
6. **Prediction** — Real-time rainfall prediction with slider inputs
7. **Dashboard** — Summary stats, charts, prediction history

---

## 📁 Dataset Format

Upload a CSV with these columns (any subset):

| Column | Description | Unit |
|--------|-------------|------|
| temperature | Air temperature | °C |
| humidity | Relative humidity | % |
| windspeed | Wind speed | km/h |
| pressure | Atmospheric pressure | hPa |
| moisture | Soil/air moisture | % |
| visibility | Visibility range | km |
| rainfall | **Target variable** | mm |

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/dataset/upload` | Upload CSV |
| GET | `/api/dataset/sample` | Load demo data |
| GET | `/api/eda/rainfall-trend` | Trend chart data |
| GET | `/api/eda/correlation` | Correlation matrix |
| GET | `/api/eda/seasonal` | Seasonal pattern |
| POST | `/api/ml/train` | Train ML models |
| POST | `/api/dl/train` | Train ANN |
| POST | `/api/rl/simulate` | Run Q-learning |
| POST | `/api/predict/rainfall` | Predict rainfall |
| GET | `/api/predict/history` | Prediction log |

---

## 👥 Team

2nd Year B.Tech Engineering — Mini Project 2024

---

## 📄 License

MIT License — Free for academic use
