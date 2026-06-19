import React, { useState, useContext } from 'react';
import { Droplets, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';

const IrrigationSuggestion = () => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({ crop: 'Wheat', area: 2, soilType: 'Loamy', temperature: 28, humidity: 60 });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/irrigation`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      setResults(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const alertColor = results?.alert?.includes('risk') ? '#fef2f2' : '#eafaf1';
  const alertBorder = results?.alert?.includes('risk') ? '#e74c3c' : '#27ae60';
  const AlertIcon = results?.alert?.includes('risk') ? AlertTriangle : CheckCircle;
  const alertIconColor = results?.alert?.includes('risk') ? '#e74c3c' : '#27ae60';

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: 'var(--dark-green)' }}>Smart Irrigation Suggestion</h2>
      <div className="grid-2">
        <div className="card glass-panel" style={{ alignSelf: 'start' }}>
          <h3 className="card-title">Farm Parameters</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Crop</label>
              <select className="form-control" name="crop" value={formData.crop} onChange={handleChange}>
                {['Wheat', 'Rice', 'Maize', 'Sugarcane', 'Tomato'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid-2" style={{ gap: '15px' }}>
              <div className="form-group">
                <label>Area (Hectares)</label>
                <input type="number" className="form-control" name="area" value={formData.area} onChange={handleChange} step="0.1" min="0.1" />
              </div>
              <div className="form-group">
                <label>Soil Type</label>
                <select className="form-control" name="soilType" value={formData.soilType} onChange={handleChange}>
                  {['Loamy', 'Sandy', 'Clay'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2" style={{ gap: '15px' }}>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" className="form-control" name="temperature" value={formData.temperature} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Humidity (%)</label>
                <input type="number" className="form-control" name="humidity" value={formData.humidity} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn btn-block" disabled={loading} style={{ marginTop: '10px' }}>
              <Droplets size={18} /> {loading ? 'Calculating...' : 'Get Irrigation Plan'}
            </button>
          </form>
        </div>

        <div className="card glass-panel">
          <h3 className="card-title">Irrigation Plan</h3>
          {results ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#eafaf1', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <Droplets size={24} color="#27ae60" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--dark-green)' }}>{results.totalWaterNeeded}L</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Total Water Needed</div>
                </div>
                <div style={{ background: '#dcecfc', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <Calendar size={24} color="#2980b9" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2980b9' }}>{results.dailyRequirement}L</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Daily Requirement</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem' }}>
                <strong>Soil Note:</strong> {results.soilNote}
              </div>

              <h4 style={{ marginBottom: '10px', color: 'var(--dark-green)' }}>Weekly Schedule</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                {results.schedule.map(({ day, amount }) => (
                  <div key={day} style={{ flex: 1, background: '#f0f4f8', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--dark-green)' }}>{day}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{amount}L</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '14px', background: alertColor, borderRadius: '10px', borderLeft: `4px solid ${alertBorder}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertIcon size={20} color={alertIconColor} />
                <span>{results.alert}</span>
              </div>
            </div>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>Submit farm data to get a personalized irrigation schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IrrigationSuggestion;
