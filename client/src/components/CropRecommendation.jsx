import React, { useState, useContext } from 'react';
import { Sprout } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';

const CropRecommendation = () => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    N: 80, P: 40, K: 40, temperature: 28, humidity: 70, ph: 6.5, rainfall: 100
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
      const response = await fetch(`${API_URL}/api/recommend`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResults(data.recommended);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{marginBottom: '20px', color: 'var(--dark-green)'}}>Crop Recommendation</h2>
      <div className="grid-2">
        <div className="card glass-panel">
          <h3 className="card-title">Input Farm Data</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{gap: '15px'}}>
              <div className="form-group">
                <label>Nitrogen (N)</label>
                <input type="number" className="form-control" name="N" value={formData.N} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phosphorus (P)</label>
                <input type="number" className="form-control" name="P" value={formData.P} onChange={handleChange} />
              </div>
            </div>
            <div className="grid-2" style={{gap: '15px'}}>
              <div className="form-group">
                <label>Potassium (K)</label>
                <input type="number" className="form-control" name="K" value={formData.K} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" className="form-control" name="temperature" value={formData.temperature} onChange={handleChange} />
              </div>
            </div>
            <div className="grid-2" style={{gap: '15px'}}>
              <div className="form-group">
                <label>Humidity (%)</label>
                <input type="number" className="form-control" name="humidity" value={formData.humidity} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>pH Level</label>
                <input type="number" step="0.1" className="form-control" name="ph" value={formData.ph} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Expected Rainfall (mm)</label>
              <input type="number" className="form-control" name="rainfall" value={formData.rainfall} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-block" disabled={loading} style={{marginTop: '10px'}}>
              {loading ? 'Analyzing with AI...' : 'Find Best Crops'}
            </button>
          </form>
        </div>

        <div className="card glass-panel">
          <h3 className="card-title">Recommended Crops</h3>
          {results ? (
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              {results.map((crop, idx) => (
                <div key={idx} style={{background: 'var(--light-green)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--primary-green)'}}>
                  <h4 style={{color: 'var(--dark-green)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}}>
                    <Sprout size={20} /> {idx + 1}. {crop.name}
                  </h4>
                  <div style={{fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                    <span>Confidence: <strong>{crop.confidence}%</strong></span>
                    <span>Time: <strong>{crop.growingTime}</strong></span>
                    <span>Water: <strong>{crop.waterReq}</strong></span>
                    <span>Profit: <strong style={{color: '#27ae60'}}>{crop.expectedProfit}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <p style={{color: 'var(--text-light)', textAlign: 'center'}}>
                Fill the form and submit to get AI recommendations based on your soil profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;
