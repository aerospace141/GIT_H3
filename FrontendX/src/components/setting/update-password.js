import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SecurePasswordUpdate = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  // ⏳ 5-minute expiry
  useEffect(() => {
    const timer = setTimeout(() => handleCancel(), 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  // 🔐 Decode user ID from JWT token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const deviceId = localStorage.getItem('deviceId');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId);
    } catch (err) {
      setError('Invalid session. Please login again.');
    }
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleConfirm = async () => {
    setError('');

    const { currentPassword, newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user/update-password`,
        { userId, currentPassword, newPassword },
        {       headers: { Authorization: `${token}`,
      'X-Device-Id': deviceId } }
      );

      window.opener?.postMessage('password-updated', window.location.origin);
      window.close();
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating password');
    }
  };

  const handleCancel = () => {
    window.opener?.postMessage('password-update-cancelled', window.location.origin);
    window.close();
  };

  if (expired) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Session Expired</h3>
        <p>This window expired after 5 minutes. Please reopen it from Settings.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>🔐 Update Password</h2>
      <input
        type="password"
        name="currentPassword"
        placeholder="Current Password"
        value={formData.currentPassword}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', margin: '10px 0' }}
        required
      />
      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        value={formData.newPassword}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', margin: '10px 0' }}
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', margin: '10px 0' }}
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleConfirm}>✅ Confirm</button>
        <button onClick={handleCancel} style={{ marginLeft: '10px' }}>
          ❌ Cancel
        </button>
      </div>
    </div>
  );
};

export default SecurePasswordUpdate;
