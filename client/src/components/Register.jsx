import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = await register(name, email, password);
    if (res.success) {
      setSuccess(res.message || 'Registration successful! Please check your email to verify your account.');
    } else {
      setError(res.message);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center', alignItems: 'center' }}>
          <img src="/favicon.svg" alt="Smart Crop Logo" style={{ width: '64px', height: '64px', marginBottom: '1rem' }} />
          <h2>Registration Successful</h2>
          <p style={{ marginBottom: '1.5rem' }}>Welcome to Smart Crop</p>
          <div className="auth-message success" style={{ marginBottom: '1.5rem' }}>
            {success}
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
            Please click the verification link sent to your email to activate your account.
          </p>
          <Link to="/login" className="auth-button" style={{ display: 'block', textDecoration: 'none', color: '#fff', textAlign: 'center' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <img src="/favicon.svg" alt="Smart Crop Logo" style={{ width: '64px', height: '64px', marginBottom: '0.5rem' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#10b981', margin: 0, letterSpacing: '0.5px' }}>Smart Crop</h1>
        </div>
        <h2>Create an Account</h2>
        <p>Get started with your smart advisor</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-button">Register</button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
