# 🌱 Smart Crop Recommendation & Yield Prediction System

A comprehensive MERN-stack application with a Python Machine Learning backend for farmers. This system provides AI-driven crop recommendations, accurate yield predictions with profitability analysis, and comprehensive soil health reports.

## 🚀 Features
- **Crop Recommendation**: ML models suggest the best 3-5 crops based on NPK, temperature, humidity, and rainfall.
- **Yield Prediction**: Forecast expected yields (tons/hectare) and profit estimation based on crop type and area.
- **Soil Analysis**: Input your NPK levels for a rapid Soil Health Report and personalized fertilizer suggestions.
- **Modern UI**: A premium, responsive dashboard with Glassmorphism, dynamic routing, and interactive data visualizations.

## 🛠 Tech Stack
- **Frontend**: React.js (Vite), React Router, Chart.js, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication
- **AI/ML Service**: Python, Flask, Scikit-learn (Endpoints proxy via Express)

## 📁 System Architecture
The application is structured into three microservices:
1. `client/`: React Frontend running on port 5173
2. `server/`: Node.js/Express REST API running on port 3000
3. `ml_service/`: Python Flask ML API running on port 5000

---

## 💻 Getting Started (Local Development)

### 1. Start the Machine Learning Service
Open a terminal in the root folder:
```powershell
cd ml_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 2. Start the Node.js Backend Server
Open a second terminal in the root folder:
```powershell
cd server
npm install
npm start
```
*(Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017` or configure your connection string)*

### 3. Start the React Frontend
Open a third terminal in the root folder:
```powershell
cd client
npm install
npm run dev
```

Browse to **http://localhost:5173** to view the main dashboard!
