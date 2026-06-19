import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      setSuccess(res.message || 'A password reset link has been sent to your email.');
    } else {
      setError(res.message || 'Failed to send reset link. Please check the email.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <Link to="/login" style={{ color: '#6b7280', display: 'flex', alignItems: 'center', textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} style={{ marginRight: '4px' }} /> Back to Login
          </Link>
          <img src="/favicon.svg" alt="Smart Crop Logo" style={{ width: '32px', height: '32px' }} />
        </div>
        <h2>Forgot Password</h2>
        <p style={{ marginBottom: '1.5rem' }}>Enter your email address and we'll send you a link to reset your password.</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-message success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="e.g. user@example.com"
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? (
                <>
                  <Loader2 className="spinner" size={16} /> Sending Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
