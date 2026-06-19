import React, { useState, useContext } from 'react';
import { BarChart3 } from 'lucide-react';
import { API_URL } from '../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AuthContext } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const YieldPrediction = () => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    crop: 'Wheat', area: 5, temperature: '', rainfall: ''
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
      const response = await fetch(`${API_URL}/api/yield`, {
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

  const chartData = {
    labels: ['Current Year', 'Projected Optimal', 'Historical Avg'],
    datasets: [
      {
        label: 'Yield (tons)',
        data: results ? [results.predictedYield, results.predictedYield * 1.15, results.predictedYield * 0.85] : [0, 0, 0],
        backgroundColor: ['rgba(46, 204, 113, 0.7)', 'rgba(52, 152, 219, 0.7)', 'rgba(241, 196, 15, 0.7)'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Yield Forecast Comparison' },
    },
  };

  return (
    <div>
      <h2 style={{marginBottom: '20px', color: 'var(--dark-green)'}}>Yield Prediction</h2>
      <div className="grid-2">
        <div className="card glass-panel" style={{alignSelf: 'start'}}>
          <h3 className="card-title">Prediction Parameters</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Crop</label>
              <select className="form-control" name="crop" value={formData.crop} onChange={handleChange}>
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Maize">Maize</option>
                <option value="Potatoes">Potatoes</option>
                <option value="Soybeans">Soybeans</option>
                <option value="Cassava">Cassava</option>
                <option value="Sweet potatoes">Sweet Potatoes</option>
                <option value="Plantains">Plantains</option>
                <option value="Yams">Yams</option>
                <option value="Sorghum">Sorghum</option>
              </select>
            </div>
            <div className="form-group">
              <label>Land Area (Hectares)</label>
              <input type="number" className="form-control" name="area" value={formData.area} onChange={handleChange} step="0.1" />
            </div>
            <div className="grid-2" style={{gap: '15px'}}>
              <div className="form-group">
                <label>Avg Temp (°C) [Optional]</label>
                <input type="number" className="form-control" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="Auto" />
              </div>
              <div className="form-group">
                <label>Rainfall (mm) [Optional]</label>
                <input type="number" className="form-control" name="rainfall" value={formData.rainfall} onChange={handleChange} placeholder="Auto" />
              </div>
            </div>
            <button type="submit" className="btn btn-block" disabled={loading} style={{marginTop: '15px'}}>
              <BarChart3 size={18} /> {loading ? 'Computing...' : 'Generate Prediction'}
            </button>
          </form>
        </div>

        <div className="card glass-panel">
          <h3 className="card-title">Results Dashboard</h3>
          {results ? (
            <div>
              <div style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid var(--accent)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{fontSize: '1.1rem', color: 'var(--text-light)'}}>Predicted Yield</span>
                  <strong style={{fontSize: '1.3rem', color: 'var(--text-dark)'}}>{results.predictedYield} tons</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px'}}>
                  <span style={{fontSize: '1.1rem', color: 'var(--text-light)'}}>Estimated Profit</span>
                  <strong style={{fontSize: '1.3rem', color: '#27ae60'}}>₹ {results.estimatedProfit.toLocaleString()}</strong>
                </div>
              </div>
              <div style={{border: '1px solid var(--border-color)', padding: '15px', borderRadius: '12px'}}>
                <Bar options={chartOptions} data={chartData} />
              </div>
            </div>
          ) : (
             <div style={{height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <p style={{color: 'var(--text-light)', textAlign: 'center'}}>
                  Awaiting input to generate ML yield forecast and financial estimates.
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YieldPrediction;
