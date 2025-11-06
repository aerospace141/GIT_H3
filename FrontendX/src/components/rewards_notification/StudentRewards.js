import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentRewards = () => {
  const [userData, setUserData] = useState(null);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      if (!token) {
        setError('Please log in to view rewards');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId 
        }
      });

      setUserData(response.data);
      setRewardHistory(response.data.rewardHistory || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load reward data');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRewardIcon = (type) => {
    return type === 'stars' ? '⭐' : '🏆';
  };

  if (loading) {
    return (
      <div className="rewards-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your rewards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rewards-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards-container">
      <style jsx>{`
        .rewards-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Arial', sans-serif;
        }

        .rewards-header {
          text-align: center;
          color: white;
          margin-bottom: 30px;
        }

        .rewards-header h1 {
          font-size: 2.5rem;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .student-info {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px;
          color: white;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .student-name {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .student-group {
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .rewards-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .reward-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          transform: translateY(0);
          transition: all 0.3s ease;
        }

        .reward-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }

        .reward-icon {
          font-size: 4rem;
          margin-bottom: 15px;
          display: block;
        }

        .reward-amount {
          font-size: 3rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }

        .reward-label {
          font-size: 1.2rem;
          color: #666;
          font-weight: 500;
        }

        .stars-card {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
        }

        .badges-card {
          background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        }

        .history-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .history-title {
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }

        .history-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          margin-bottom: 10px;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }

        .history-item-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .history-item-icon {
          font-size: 1.5rem;
        }

        .history-item-details h4 {
          margin: 0;
          color: #333;
          font-size: 1rem;
        }

        .history-item-details p {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 0.9rem;
        }

        .history-item-amount {
          font-size: 1.2rem;
          font-weight: bold;
          color: #667eea;
        }

        .no-history {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: white;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.3);
          border-left: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          color: white;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .error-message button {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 20px;
        }

        .back-button {
          position: fixed;
          top: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <button className="back-button" onClick={() => window.history.back()}>
        ← Back
      </button>

      <div className="rewards-header">
        <h1>🎉 My Rewards 🎉</h1>
      </div>

      {userData && (
        <div className="student-info">
          <div className="student-name">
            {userData.firstName} {userData.lastName}
          </div>
          {userData.group && (
            <div className="student-group">
              Group: {userData.group}
            </div>
          )}
        </div>
      )}

      <div className="rewards-stats">
        <div className="reward-card stars-card">
          <span className="reward-icon">⭐</span>
          <div className="reward-amount">
            {userData?.rewards?.stars || 0}
          </div>
          <div className="reward-label">Stars Earned</div>
        </div>

        <div className="reward-card badges-card">
          <span className="reward-icon">🏆</span>
          <div className="reward-amount">
            {userData?.rewards?.badges || 0}
          </div>
          <div className="reward-label">Badges Earned</div>
        </div>
      </div>

      <div className="history-section">
        <h2 className="history-title">Reward History</h2>
        
        {rewardHistory.length > 0 ? (
          <div className="history-list">
            {rewardHistory.map((reward, index) => (
              <div key={index} className="history-item">
                <div className="history-item-left">
                  <span className="history-item-icon">
                    {getRewardIcon(reward.type)}
                  </span>
                  <div className="history-item-details">
                    <h4>{reward.note || `${reward.type} reward`}</h4>
                    <p>{formatDate(reward.date)}</p>
                  </div>
                </div>
                <div className="history-item-amount">
                  +{reward.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-history">
            <p>No rewards earned yet. Keep practicing to earn stars and badges!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRewards;