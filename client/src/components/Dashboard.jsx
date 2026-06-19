import React, { useEffect, useState, useContext } from 'react';
import { Sprout, BarChart3, TestTube2, Droplets, TrendingUp, Bell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: '--', totalPredictions: '--', totalSoilTests: '--' });

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, [token]);

  const statCards = [
    { icon: <Sprout size={24} />, bg: '#ffeaa7', color: '#d35400', value: '3', label: 'Recommended Crops' },
    { icon: <BarChart3 size={24} />, bg: '#eafaf1', color: '#27ae60', value: stats.totalPredictions, label: 'Yield Predictions' },
    { icon: <TestTube2 size={24} />, bg: '#dcecfc', color: '#2980b9', value: stats.totalSoilTests, label: 'Soil Tests' },
    { icon: <TrendingUp size={24} />, bg: '#f3e8ff', color: '#8e44ad', value: stats.totalUsers, label: 'Registered Farmers' },
  ];

  const quickActions = [
    { icon: <Sprout size={20} />, label: 'Crop Recommendation', path: '/recommendation', color: '#27ae60' },
    { icon: <BarChart3 size={20} />, label: 'Yield Prediction', path: '/yield', color: '#2980b9' },
    { icon: <TestTube2 size={20} />, label: 'Soil Analysis', path: '/soil', color: '#8e44ad' },
    { icon: <Droplets size={20} />, label: 'Irrigation Plan', path: '/irrigation', color: '#16a085' },
    { icon: <TrendingUp size={20} />, label: 'Market Prices', path: '/market', color: '#d35400' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications', color: '#c0392b' },
  ];

  return (
    <div>
      <div className="grid-3" style={{ marginBottom: '30px' }}>
        {statCards.map(({ icon, bg, color, value, label }) => (
          <div key={label} className="stat-card">
            <div className="icon-wrapper" style={{ backgroundColor: bg, color }}>{icon}</div>
            <div className="content">
              <h3>{value}</h3>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card glass-panel" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {quickActions.map(({ icon, label, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: '#f8fafc', transition: 'all 0.2s', fontWeight: '500', fontSize: '0.9rem',
                color: 'var(--text-dark)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#eafaf1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color }}>{icon}</span> {label}
              </div>
              <ArrowRight size={14} color="var(--text-light)" />
            </button>
          ))}
        </div>
      </div>

      <div className="card glass-panel">
        <h3 className="card-title">Getting Started</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { step: '1', text: 'Update your Farmer Profile with location and soil type for better recommendations.' },
            { step: '2', text: 'Run a Soil Analysis to understand your NPK levels and get fertilizer suggestions.' },
            { step: '3', text: 'Use Crop Recommendation to find the best crops for your soil and climate.' },
            { step: '4', text: 'Check Market Prices to pick the most profitable crop before planting.' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0, fontSize: '0.85rem' }}>{step}</div>
              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.6' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
