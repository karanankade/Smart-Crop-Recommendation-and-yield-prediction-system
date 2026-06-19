import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CropRecommendation from './components/CropRecommendation';
import YieldPrediction from './components/YieldPrediction';
import SoilAnalysis from './components/SoilAnalysis';
import WeatherIntegration from './components/WeatherIntegration';
import IrrigationSuggestion from './components/IrrigationSuggestion';
import MarketAnalysis from './components/MarketAnalysis';
import Notifications from './components/Notifications';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { AuthContext } from './context/AuthContext';
import { NotificationContext } from './context/NotificationContext';
import { Home, Sprout, BarChart3, TestTube2, UserCircle, LogOut, CloudSun, Droplets, TrendingUp, Bell, Moon, Sun } from 'lucide-react';
import './index.css';

function App() {
  const { user, loading, logout } = React.useContext(AuthContext);
  const { unreadCount } = React.useContext(NotificationContext);
  const [darkMode, setDarkMode] = useState(false);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      <Router>
        {!user ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<Login />} />
          </Routes>
        ) : (
          <div className="app-container">
            <aside className="sidebar">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/favicon.svg" alt="Smart Crop Logo" style={{ width: '28px', height: '28px' }} />
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '0.5px' }}>Smart Crop</h2>
                </div>
                <button
                  onClick={() => setDarkMode(d => !d)}
                  title="Toggle dark mode"
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
              <nav>
                <NavLink to="/" end><Home size={18} /> Dashboard</NavLink>
                <NavLink to="/recommendation"><Sprout size={18} /> Crop Recommendation</NavLink>
                <NavLink to="/yield"><BarChart3 size={18} /> Yield Prediction</NavLink>
                <NavLink to="/soil"><TestTube2 size={18} /> Soil Analysis</NavLink>
                <NavLink to="/weather"><CloudSun size={18} /> Weather</NavLink>
                <NavLink to="/irrigation"><Droplets size={18} /> Irrigation</NavLink>
                <NavLink to="/market"><TrendingUp size={18} /> Market Prices</NavLink>
                <NavLink to="/notifications"><Bell size={18} /> Notifications</NavLink>
                <NavLink to="/profile"><UserCircle size={18} /> Profile</NavLink>
              </nav>
              <div style={{ marginTop: 'auto', padding: '1rem 0 0' }}>
                <button
                  onClick={logout}
                  className="auth-button"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#dc2626' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </aside>

            <main className="main-content">
              <header className="header">
                <h1>Welcome, {user.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <NavLink to="/notifications" style={{ position: 'relative', color: 'var(--text-dark)' }}>
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span style={{ 
                        position: 'absolute', 
                        top: '-8px', 
                        right: '-8px', 
                        background: '#e74c3c', 
                        color: '#fff', 
                        borderRadius: '50%', 
                        width: '18px', 
                        height: '18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.65rem', 
                        fontWeight: 'bold' 
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a6e3e&color=fff`}
                    alt="Profile"
                    style={{ borderRadius: '50%', width: '40px', height: '40px' }}
                  />
                </div>
              </header>

              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/recommendation" element={<CropRecommendation />} />
                <Route path="/yield" element={<YieldPrediction />} />
                <Route path="/soil" element={<SoilAnalysis />} />
                <Route path="/weather" element={<WeatherIntegration />} />
                <Route path="/irrigation" element={<IrrigationSuggestion />} />
                <Route path="/market" element={<MarketAnalysis />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        )}
      </Router>
    </div>
  );
}

export default App;
