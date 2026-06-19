import React, { useState, useContext } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MarketAnalysis = () => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({ crop: 'Wheat', area: 2 });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/market`, {
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

  const chartData = results ? {
    labels: results.allPrices.map(p => p.crop),
    datasets: [{
      label: 'Price (₹/quintal)',
      data: results.allPrices.map(p => p.price),
      backgroundColor: results.allPrices.map(p =>
        p.crop === results.selectedCrop ? 'rgba(43,162,95,0.85)' : 'rgba(43,162,95,0.3)'
      ),
      borderRadius: 6,
    }]
  } : null;

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: 'var(--dark-green)' }}>Market Price & Profit Analysis</h2>
      <div className="grid-2">
        <div className="card glass-panel" style={{ alignSelf: 'start' }}>
          <h3 className="card-title">Analysis Parameters</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Crop</label>
              <select className="form-control" name="crop" value={formData.crop} onChange={handleChange}>
                {['Wheat', 'Rice', 'Maize', 'Sugarcane', 'Tomato', 'Cotton', 'Soybean'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Land Area (Hectares)</label>
              <input type="number" className="form-control" name="area" value={formData.area} onChange={handleChange} step="0.1" min="0.1" />
            </div>
            <button type="submit" className="btn btn-block" disabled={loading} style={{ marginTop: '10px' }}>
              <TrendingUp size={18} /> {loading ? 'Analyzing...' : 'Analyze Market'}
            </button>
          </form>
        </div>

        <div className="card glass-panel">
          <h3 className="card-title">Market Report</h3>
          {results ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#eafaf1', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Market Price</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--dark-green)' }}>₹{results.pricePerQuintal}/q</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: results.trend.startsWith('+') ? '#27ae60' : '#e74c3c' }}>
                    {results.trend.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {results.trend}
                  </div>
                </div>
                <div style={{ background: '#dcecfc', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Market Demand</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#2980b9' }}>{results.demand}</div>
                </div>
                <div style={{ background: '#fef9e7', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Est. Revenue</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>₹{results.estimatedRevenue.toLocaleString()}</div>
                </div>
                <div style={{ background: '#eafaf1', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Est. Profit</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#27ae60' }}>₹{results.estimatedProfit.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ padding: '12px', background: '#fef9e7', borderRadius: '10px', borderLeft: '4px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Award size={20} color="#d35400" />
                <span><strong>Best Crop Right Now:</strong> {results.bestCrop} @ ₹{results.bestPrice}/quintal</span>
              </div>
            </div>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>Select a crop and area to see market analysis and profit estimates.</p>
            </div>
          )}
        </div>
      </div>

      {results && chartData && (
        <div className="card glass-panel">
          <h3 className="card-title">Live Market Prices Comparison (₹/quintal)</h3>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>
      )}

      {results && (
        <div className="card glass-panel">
          <h3 className="card-title">All Crop Prices</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: 'var(--light-green)' }}>
                  {['Crop', 'Price (₹/q)', 'Trend', 'Demand'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--dark-green)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.allPrices.map((p, i) => (
                  <tr key={p.crop} style={{ background: p.crop === results.selectedCrop ? '#eafaf1' : i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: p.crop === results.selectedCrop ? '700' : '400' }}>{p.crop}</td>
                    <td style={{ padding: '12px 16px' }}>₹{p.price}</td>
                    <td style={{ padding: '12px 16px', color: p.trend.startsWith('+') ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {p.trend.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {p.trend}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{p.demand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;
