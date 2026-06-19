import React, { useState, useContext } from 'react';
import { TestTube2, AlertTriangle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';

const SoilAnalysis = () => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({ 
    N: 45, P: 25, K: 35, humidity: 75, temperature: 25, moisture: 40, soilType: 'Loamy', crop: 'Wheat' 
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/soil`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{marginBottom: '20px', color: 'var(--dark-green)'}}>Soil Analysis & Fertilizer Recommendation</h2>
      <div className="grid-2">
        <div className="card glass-panel" style={{alignSelf: 'start'}}>
          <h3 className="card-title">Manual Soil Test Entry</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-3" style={{gap: '15px'}}>
              <div className="form-group">
                <label>Nitrogen (N)</label>
                <input type="number" className="form-control" name="N" value={formData.N} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phosphorus (P)</label>
                <input type="number" className="form-control" name="P" value={formData.P} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Potassium (K)</label>
                <input type="number" className="form-control" name="K" value={formData.K} onChange={handleChange} />
              </div>
            </div>
            <div className="grid-2" style={{gap: '15px'}}>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" className="form-control" name="temperature" value={formData.temperature} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Humidity (%)</label>
                <input type="number" className="form-control" name="humidity" value={formData.humidity} onChange={handleChange} />
              </div>
            </div>
            <div className="grid-2" style={{gap: '15px'}}>
              <div className="form-group">
                <label>Moisture (%)</label>
                <input type="number" className="form-control" name="moisture" value={formData.moisture} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Soil Type</label>
                <select className="form-control" name="soilType" value={formData.soilType} onChange={handleChange}>
                  {['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Target Crop</label>
              <select className="form-control" name="crop" value={formData.crop} onChange={handleChange}>
                {['Wheat', 'Paddy', 'Maize', 'Sugarcane', 'Cotton', 'Barley', 'Millets', 'Pulses', 'Groundnuts', 'Tobacco', 'Oil seeds'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-block" disabled={loading} style={{marginTop: '15px'}}>
              <TestTube2 size={18} /> {loading ? 'Analyzing...' : 'Generate Health Report'}
            </button>
          </form>
        </div>

        <div className="card glass-panel">
          <h3 className="card-title">Soil Health Report</h3>
          {results ? (
            <div>
              <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
                <div style={{flex: 1, padding: '15px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center'}}>
                  <strong style={{display: 'block', color: 'var(--text-light)'}}>Nitrogen</strong>
                  <span style={{color: results.soilTest.Nitrogen === 'Low' ? '#e74c3c' : '#27ae60', fontWeight: 'bold', fontSize: '1.2rem'}}>{results.soilTest.Nitrogen}</span>
                </div>
                <div style={{flex: 1, padding: '15px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center'}}>
                  <strong style={{display: 'block', color: 'var(--text-light)'}}>Phosphorus</strong>
                  <span style={{color: results.soilTest.Phosphorus === 'Low' ? '#e74c3c' : '#27ae60', fontWeight: 'bold', fontSize: '1.2rem'}}>{results.soilTest.Phosphorus}</span>
                </div>
                <div style={{flex: 1, padding: '15px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center'}}>
                  <strong style={{display: 'block', color: 'var(--text-light)'}}>Potassium</strong>
                  <span style={{color: results.soilTest.Potassium === 'Low' ? '#e74c3c' : '#27ae60', fontWeight: 'bold', fontSize: '1.2rem'}}>{results.soilTest.Potassium}</span>
                </div>
              </div>
              
              <div style={{marginBottom: '20px'}}>
                <h4 style={{marginBottom: '10px'}}>Fertilizer Suggestions</h4>
                <ul style={{listStyle: 'none'}}>
                  {results.fertilizerSuggestions.map((s, idx) => (
                    <li key={idx} style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                      <CheckCircle size={18} color="#27ae60" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div style={{padding: '15px', background: results.diseaseRisk.includes('Moderate') ? '#fef9e7' : '#eafaf1', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                {results.diseaseRisk.includes('Moderate') ? <AlertTriangle color="#f39c12" /> : <CheckCircle color="#27ae60" />}
                <span><strong>Disease Risk:</strong> {results.diseaseRisk}</span>
              </div>
            </div>
          ) : (
            <div style={{height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <p style={{color: 'var(--text-light)', textAlign: 'center'}}>Submit soil NPK data to receive fertilizer and health recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilAnalysis;
