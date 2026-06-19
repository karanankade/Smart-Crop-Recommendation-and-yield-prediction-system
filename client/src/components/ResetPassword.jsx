import React, { useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);

    if (res.success) {
      setSuccess(res.message || 'Your password has been reset successfully!');
    } else {
      setError(res.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <img src="/favicon.svg" alt="Smart Crop Logo" style={{ width: '64px', height: '64px', marginBottom: '0.5rem' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#10b981', margin: 0, letterSpacing: '0.5px' }}>Smart Crop</h1>
        </div>
        <h2>Reset Password</h2>
        <p style={{ marginBottom: '1.5rem' }}>Create a new password for your account.</p>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <>
            <div className="auth-message success" style={{ marginBottom: '1.5rem' }}>
              {success}
            </div>
            <Link to="/login" className="auth-button" style={{ display: 'block', textDecoration: 'none', color: '#fff', textAlign: 'center' }}>
              Go to Login
            </Link>
          </>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Re-enter new password"
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? (
                <>
                  <Loader2 className="spinner" size={16} /> Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
