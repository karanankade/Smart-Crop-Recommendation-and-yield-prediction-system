import React, { useState, useContext } from 'react';
import { CloudRain, Sun, Wind, Droplets, Thermometer, AlertTriangle, Search } from 'lucide-react';

const weatherIconMap = {
  Clear: <Sun size={32} color="#f1c40f" />,
  Rain: <CloudRain size={32} color="#3498db" />,
  Clouds: <CloudRain size={32} color="#95a5a6" />,
  Drizzle: <CloudRain size={32} color="#74b9ff" />,
  Thunderstorm: <AlertTriangle size={32} color="#e74c3c" />,
};

import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';

const WeatherIntegration = () => {
  const { token } = useContext(AuthContext);
  const [city, setCity] = useState('Pune');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(city)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Request failed');
      setData(json);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const getAlert = (weather, humidity) => {
    if (weather === 'Rain' || weather === 'Thunderstorm') return { type: 'warning', msg: '🌧️ Rain expected — delay irrigation and harvesting.' };
    if (humidity < 30) return { type: 'danger', msg: '☀️ Drought risk — increase irrigation frequency.' };
    return { type: 'success', msg: '✅ Weather conditions are favorable for farming.' };
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: 'var(--dark-green)' }}>Weather Integration</h2>

      <div className="card glass-panel" style={{ marginBottom: '24px' }}>
        <form onSubmit={fetchWeather} style={{ display: 'flex', gap: '12px' }}>
          <input
            className="form-control"
            style={{ flex: 1 }}
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Enter city name..."
          />
          <button type="submit" className="btn" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            <Search size={18} /> {loading ? 'Fetching...' : 'Get Weather'}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              {error.toLowerCase().includes('invalid api key') || error.toLowerCase().includes('401')
                ? <><strong>API Key Error (401):</strong> Your OpenWeatherMap key exists but is not yet active. Free keys take <strong>up to 2 hours</strong> to activate after registration. Wait and try again. <a href="https://home.openweathermap.org/api_keys" target="_blank" rel="noreferrer" style={{ color: '#dc2626' }}>Check key status →</a></>
                : error === 'Weather API key not configured. Add WEATHER_API_KEY to .env'
                  ? <>Weather API key not set. Add your free key from <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" style={{ color: '#dc2626' }}>openweathermap.org</a> to <code>server/.env</code></>
                  : error
              }
            </div>
          </div>
        )}
      </div>

      {data && (
        <>
          {/* Current Weather */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div className="card glass-panel">
              <h3 className="card-title">Current Conditions — {data.current.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                {weatherIconMap[data.current.weather[0].main] || <Sun size={32} />}
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--dark-green)' }}>
                    {Math.round(data.current.main.temp)}°C
                  </div>
                  <div style={{ color: 'var(--text-light)', textTransform: 'capitalize' }}>
                    {data.current.weather[0].description}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { icon: <Droplets size={16} color="#3498db" />, label: 'Humidity', val: `${data.current.main.humidity}%` },
                  { icon: <Wind size={16} color="#74b9ff" />, label: 'Wind', val: `${data.current.wind.speed} m/s` },
                  { icon: <Thermometer size={16} color="#e74c3c" />, label: 'Feels Like', val: `${Math.round(data.current.main.feels_like)}°C` },
                  { icon: <CloudRain size={16} color="#95a5a6" />, label: 'Pressure', val: `${data.current.main.pressure} hPa` },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{label}</div>
                      <div style={{ fontWeight: '600' }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card glass-panel">
              <h3 className="card-title">Farming Alert</h3>
              {(() => {
                const alert = getAlert(data.current.weather[0].main, data.current.main.humidity);
                const colors = { warning: '#fef9e7', danger: '#fef2f2', success: '#eafaf1' };
                const borders = { warning: '#f39c12', danger: '#e74c3c', success: '#27ae60' };
                return (
                  <div style={{ padding: '20px', background: colors[alert.type], borderRadius: '12px', borderLeft: `4px solid ${borders[alert.type]}`, fontSize: '1rem', lineHeight: '1.8' }}>
                    {alert.msg}
                    <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                      <strong>Sunrise:</strong> {new Date(data.current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}&nbsp;&nbsp;
                      <strong>Sunset:</strong> {new Date(data.current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 7-day Forecast */}
          <div className="card glass-panel">
            <h3 className="card-title">7-Day Forecast</h3>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {data.forecast.list.map((item, idx) => (
                <div key={idx} style={{ minWidth: '100px', background: '#f8fafc', borderRadius: '12px', padding: '14px', textAlign: 'center', flex: '0 0 auto' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '8px' }}>
                    {new Date(item.dt * 1000).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ marginBottom: '8px' }}>{weatherIconMap[item.weather[0].main] || <Sun size={24} />}</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{Math.round(item.main.temp)}°C</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>{item.weather[0].description}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherIntegration;
