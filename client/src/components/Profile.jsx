import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    farmSize: '',
    soilType: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        farmSize: user.farmSize || '',
        soilType: user.soilType || '',
        password: '' // Don't populate password
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // Only send password if it's filled to avoid overriding it with empty string
    const dataToSend = { ...formData };
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    const res = await updateProfile(dataToSend);
    if (res.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to update profile' });
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Farmer Profile</h2>
        <p>Update your details to get better recommendations</p>
      </div>
      
      {message.text && (
        <div className={`auth-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Location (City/Region)</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Pune, Maharashtra" />
          </div>
          <div className="form-group">
            <label>Farm Size (Hectares)</label>
            <input type="number" name="farmSize" value={formData.farmSize} onChange={handleChange} min="0" step="0.1" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Primary Soil Type</label>
            <select name="soilType" value={formData.soilType} onChange={handleChange}>
              <option value="">Select Soil Type</option>
              <option value="Alluvial">Alluvial</option>
              <option value="Black">Black</option>
              <option value="Red">Red</option>
              <option value="Laterite">Laterite</option>
              <option value="Loamy">Loamy</option>
              <option value="Sandy">Sandy</option>
            </select>
          </div>
          <div className="form-group">
            <label>New Password (Leave blank to keep current)</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
