import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const { verifyEmail } = useContext(AuthContext);
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }
      const res = await verifyEmail(token);
      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(res.message || 'Verification link is invalid or has expired.');
      }
    };
    performVerification();
  }, [token, verifyEmail]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', alignItems: 'center' }}>
        <img src="/favicon.svg" alt="Smart Crop Logo" style={{ width: '64px', height: '64px', marginBottom: '1.5rem' }} />
        {status === 'verifying' && (
          <>
            <Loader2 className="spinner" size={48} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
            <h2>Verifying Email</h2>
            <p style={{ marginTop: '1rem' }}>Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
            <h2>Email Verified!</h2>
            <div className="auth-message success" style={{ width: '100%', marginTop: '1rem', marginBottom: '1.5rem' }}>
              {message}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              Your account is now active. You can log in with your email and password.
            </p>
            <Link to="/login" className="auth-button" style={{ display: 'block', width: '100%', textDecoration: 'none', color: '#fff', textAlign: 'center' }}>
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} style={{ color: '#dc2626', marginBottom: '1.5rem' }} />
            <h2>Verification Failed</h2>
            <div className="auth-message error" style={{ width: '100%', marginTop: '1rem', marginBottom: '1.5rem' }}>
              {message}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              The verification link might have expired or is incorrect. Try registering again.
            </p>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <Link to="/register" className="auth-button" style={{ flex: 1, textDecoration: 'none', color: '#fff', textAlign: 'center', backgroundColor: '#6b7280' }}>
                Register
              </Link>
              <Link to="/login" className="auth-button" style={{ flex: 1, textDecoration: 'none', color: '#fff', textAlign: 'center' }}>
                Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
