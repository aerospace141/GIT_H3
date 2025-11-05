import React, { useState, useRef, useEffect } from 'react';
import { Home, Check, X, RefreshCw, Play } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import bdaLogo from '../resources/BDA-avc.png';

const ThreeGames = () => {
  const [currentGame, setCurrentGame] = useState('menu');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    totalGames: 0,
    totalCorrect: 0,
    totalScore: 0,
    gameTypes: {},
    dailyStats: {},
    history: []
  });
  
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');

    if (token) {
      axios.get(`${API_URL}/auth/verify`, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId 
        }
      })
      .then(response => {
        setUserId(response.data.userId);
        fetchUserData(response.data.userId);
        console.log("User authenticated:", response.data.userId);
        console.log("user", response.userId)
      })
      .catch(err => {
        console.error("Authentication error:", err);
        localStorage.removeItem('token');
        setIsLoading(false);
        loadLocalData();
      });
    } else {
      loadLocalData();
      setIsLoading(false);
    }
  }, []);


  const loadLocalData = () => {
    const savedData = localStorage.getItem('threeGamesPerformance');
    if (savedData) {
      try {
        setPerformanceData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error parsing saved performance data", e);
      }
    }
  };

  const fetchUserData = (uid) => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');

    setIsLoading(true);
    axios.get(`${API_URL}/performance/${uid}`, {
      headers: { 
        Authorization: `${token}`,
        'X-Device-Id': deviceId 
      }
    })
    .then(response => {
      if (response.data) {
        setPerformanceData(response.data);
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Error fetching user data:", err);
      setError("Could not load your data. Using local data instead.");
      loadLocalData();
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (isLoading) return;
    
    localStorage.setItem('threeGamesPerformance', JSON.stringify(performanceData));
    
    const deviceId = localStorage.getItem('deviceId');
    if (userId) {
      const timerId = setTimeout(() => {
        axios.post(`${API_URL}/performance/${userId}`, performanceData, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem('token')}`,
            'X-Device-Id': deviceId
          }
        })
        .then(response => {
          console.log("Successfully saved to server:", response.data);
        })
        .catch(err => {
          console.error("Error saving data to server:", err);
        });
      }, 2000);
      
      return () => clearTimeout(timerId);
    }
  }, [performanceData, userId, isLoading]);



  const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="page-loader-overlay">
      <div className="page-loader-content">
        <div className="page-loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="page-loader-text">{message}</div>
      </div>

      <style>{`
        .page-loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(102, 126, 234, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: page-loader-fadeIn 0.3s ease;
        }

        @keyframes page-loader-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .page-loader-content {
          text-align: center;
        }

        .page-loader-spinner {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          animation: spinner-rotate 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring:nth-child(1) {
          animation-delay: -0.45s;
        }

        .spinner-ring:nth-child(2) {
          animation-delay: -0.3s;
          opacity: 0.7;
        }

        .spinner-ring:nth-child(3) {
          animation-delay: -0.15s;
          opacity: 0.5;
        }

        @keyframes spinner-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .page-loader-text {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: 1px;
          animation: text-pulse 1.5s ease-in-out infinite;
        }

        @keyframes text-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

  const getCurrentDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const updatePerformanceData = (gameType, correct, score, additionalData = {}) => {
    const today = getCurrentDateString();
    
    setPerformanceData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      newData.totalGames = (newData.totalGames || 0) + 1;
      newData.totalCorrect = (newData.totalCorrect || 0) + (correct ? 1 : 0);
      newData.totalScore = (newData.totalScore || 0) + score;
      
      if (!newData.gameTypes[gameType]) {
        newData.gameTypes[gameType] = {
          plays: 0,
          correct: 0,
          score: 0,
          totalQuestions: 0,
          correctAnswers: 0
        };
      }
      newData.gameTypes[gameType].plays += 1;
      newData.gameTypes[gameType].correct += correct ? 1 : 0;
      newData.gameTypes[gameType].score += score;
      newData.gameTypes[gameType].totalQuestions += (additionalData.totalQuestions || 1);
      newData.gameTypes[gameType].correctAnswers += (additionalData.correctAnswers || (correct ? 1 : 0));
      
      if (!newData.dailyStats[today]) {
        newData.dailyStats[today] = {
          plays: 0,
          correct: 0,
          score: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          gameTypes: {}
        };
      }
      newData.dailyStats[today].plays += 1;
      newData.dailyStats[today].correct += correct ? 1 : 0;
      newData.dailyStats[today].score += score;
      newData.dailyStats[today].totalQuestions += (additionalData.totalQuestions || 1);
      newData.dailyStats[today].correctAnswers += (additionalData.correctAnswers || (correct ? 1 : 0));
      
      if (!newData.dailyStats[today].gameTypes[gameType]) {
        newData.dailyStats[today].gameTypes[gameType] = {
          plays: 0,
          correct: 0,
          score: 0,
          totalQuestions: 0,
          correctAnswers: 0
        };
      }
      newData.dailyStats[today].gameTypes[gameType].plays += 1;
      newData.dailyStats[today].gameTypes[gameType].correct += correct ? 1 : 0;
      newData.dailyStats[today].gameTypes[gameType].score += score;
      newData.dailyStats[today].gameTypes[gameType].totalQuestions += (additionalData.totalQuestions || 1);
      newData.dailyStats[today].gameTypes[gameType].correctAnswers += (additionalData.correctAnswers || (correct ? 1 : 0));
      
      newData.history = newData.history || [];
      newData.history.unshift({
        date: today,
        timestamp: new Date().toISOString(),
        gameType,
        difficulty: additionalData.difficulty || 'N/A',
        speed: additionalData.speed || 0,
        count: additionalData.count || 1,
        correct,
        score,
        maxScore: additionalData.maxScore || score,
        totalQuestions: additionalData.totalQuestions || 1,
        correctAnswers: additionalData.correctAnswers || (correct ? 1 : 0),
        accuracy: additionalData.accuracy || (correct ? '100%' : '0%'),
        userId
      });
      
      if (newData.history.length > 100) {
        newData.history = newData.history.slice(0, 100);
      }
      
      return newData;
    });
  };

  // if (isLoading) {
  //   return(
  //     <div className="edugame-loader-wrapper">
  //       <div className="edugame-spinner-circle"></div>
  //       <div className="edugame-loading-text">Loading Your Games...</div>
  //     </div>
  //   );
   
  // }

  if (isLoading) {
    return <PageLoader message="Loading Your Games..." />;
  }
  
return (
  <div className="edugame-main-container">
    {error && (
      <div className="edugame-error-banner">
        <span className="edugame-error-message">{error}</span>
        <button onClick={() => setError(null)} className="edugame-error-dismiss">×</button>
      </div>
    )}
    
    {currentGame === 'menu' && <UpdatedGameMenu setCurrentGame={setCurrentGame} navigate={navigate} userId={userId} />}
    {currentGame === 'table' && <TableGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
    {currentGame === 'shape-menu' && <ShapeGamesMenu setCurrentGame={setCurrentGame} />}
    {currentGame === 'circle' && <CircleGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
    {currentGame === 'rectangle' && <RectangleGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
    {currentGame === 'square' && <SquareGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
    {currentGame === 'triangle' && <TriangleGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
    {currentGame === 'pattern' && <PatternGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
    
      <style>{`
        .edugame-main-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
        }
        
        .edugame-loader-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }
        
        .edugame-spinner-circle {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: edugame-spin 1s linear infinite;
        }
        
        @keyframes edugame-spin {
          to { transform: rotate(360deg); }
        }
        
        .edugame-loading-text {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          letter-spacing: 0.5px;
        }
        
        .edugame-error-banner {
          max-width: 90%;
          margin: 0 auto 1rem;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .edugame-error-message {
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .edugame-error-dismiss {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          cursor: pointer;
          padding: 0 0.5rem;
          transition: transform 0.2s;
        }
        
        .edugame-error-dismiss:hover {
          transform: scale(1.2);
        }
        
        .edugame-menu-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .edugame-header-bar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .edugame-title-main {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          text-align: center;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.5px;
        }
        
        .edugame-header-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .edugame-sync-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          color: white;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .edugame-btn-login,
        .edugame-btn-dashboard {
          padding: 0.6rem 1.25rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .edugame-btn-login {
          background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
          color: white;
        }
        
        .edugame-btn-dashboard {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }
        
        .edugame-btn-login:hover,
        .edugame-btn-dashboard:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .edugame-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        
        .edugame-game-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem 1.5rem;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border: 2px solid transparent;
        }
        
        .edugame-game-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
          border-color: white;
        }
        
        .edugame-card-icon {
          font-size: 4rem;
          text-align: center;
          margin-bottom: 1rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }
        
        .edugame-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .edugame-card-desc {
          text-align: center;
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .edugame-activity-container {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 1.5rem;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
          max-width: 900px;
          margin: 0 auto;
        }
        
        .edugame-back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1.5rem;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .edugame-back-button:hover {
          background: rgba(100, 116, 139, 0.1);
          color: #334155;
        }
        
        .edugame-activity-header {
          font-size: 2rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .edugame-settings-group {
          margin-bottom: 1.5rem;
        }
        
        .edugame-setting-label {
          display: block;
          font-size: 1.05rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.75rem;
        }
        
        .edugame-select-input,
        .edugame-range-input {
          width: 100%;
          padding: 0.875rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }
        
        .edugame-select-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .edugame-range-input {
          padding: 0.5rem 0;
          accent-color: #667eea;
        }
        
        .edugame-btn-primary,
        .edugame-btn-success,
        .edugame-btn-warning,
        .edugame-btn-secondary {
          width: 100%;
          padding: 1rem;
          border-radius: 14px;
          font-size: 1.05rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        .edugame-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .edugame-btn-success {
          background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
          color: white;
        }
        
        .edugame-btn-warning {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }
        
        .edugame-btn-secondary {
          background: linear-gradient(135deg, #868f96 0%, #596164 100%);
          color: white;
        }
        
        .edugame-btn-primary:hover,
        .edugame-btn-success:hover,
        .edugame-btn-warning:hover,
        .edugame-btn-secondary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
        
        .edugame-gameplay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .edugame-gameplay-title {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .edugame-timer-display {
          font-size: 1.5rem;
          font-weight: 800;
          padding: 0.5rem 1.25rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .edugame-timer-critical {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          animation: edugame-pulse 1s infinite;
        }
        
        @keyframes edugame-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .edugame-questions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .edugame-question-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
            min-width: 0; /* Allow shrinking */

        }
        
        .edugame-question-text {
          font-size: 1.1rem;
          font-weight: 700;
          color: #334155;
          min-width: 120px;
           flex-shrink: 0; /* Don't shrink the question */
  white-space: nowrap;
        }

        @media (max-width: 639px) {
  .edugame-question-text {
    min-width: 90px;
    font-size: 0.95rem;
  }
  
  .edugame-answer-input {
    padding: 0.625rem;
    font-size: 0.95rem;
  }
  
  .edugame-questions-grid {
    gap: 0.75rem;
  }
}
        
        .edugame-answer-input {
          flex: 1;
            min-width: 0; /* Critical: allows input to shrink */

          padding: 0.875rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .edugame-answer-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .edugame-result-panel {
          text-align: center;
          margin-bottom: 1.5rem;
          padding: 2rem 1.5rem;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .edugame-result-success {
          background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
        }
        
        .edugame-result-failure {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        }
        
        .edugame-result-emoji {
          font-size: 4rem;
          margin-bottom: 1rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }
        
        .edugame-result-status {
          font-size: 1.75rem;
          font-weight: 800;
          color: #334155;
          margin-bottom: 0.75rem;
        }
        
        .edugame-result-stats {
          font-size: 1.25rem;
          color: #475569;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .edugame-result-score {
          font-size: 1.1rem;
          color: #64748b;
          font-weight: 600;
        }
        
        .edugame-answers-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.875rem;
          margin-bottom: 1.5rem;
        }
        
        .edugame-answer-item {
          padding: 1rem;
          border-radius: 12px;
          border: 2px solid;
          transition: all 0.3s ease;
        }
        
        .edugame-answer-correct {
          background: rgba(209, 250, 229, 0.5);
          border-color: #10b981;
        }
        
        .edugame-answer-incorrect {
          background: rgba(254, 226, 226, 0.5);
          border-color: #ef4444;
        }
        
        .edugame-answer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        
        .edugame-answer-equation {
          font-weight: 600;
          color: #334155;
        }
        
        .edugame-answer-detail {
          font-size: 0.9rem;
          color: #64748b;
        }
        
        .edugame-action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .edugame-action-buttons > button {
          flex: 1;
          min-width: 140px;
        }
        
        .edugame-canvas-wrapper {
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        .edugame-canvas-hint {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #64748b;
          font-weight: 600;
        }
        
        .edugame-drawing-canvas {
          border: 4px solid #e2e8f0;
          border-radius: 16px;
          cursor: crosshair;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          background: white;
          max-width: 100%;
          height: auto;
        }
        
        .edugame-result-perfect {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        }
        
        .edugame-result-good {
          background: linear-gradient(135deg, #fff1b8 0%, #f9d976 100%);
        }
        
        .edugame-result-try {
          background: linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%);
        }
        
        .edugame-pattern-instruction {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .edugame-pattern-name {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .edugame-pattern-hint {
          color: #64748b;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .edugame-comparison-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .edugame-comparison-item {
          text-align: center;
        }
        
        .edugame-comparison-label {
          font-size: 1.1rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.75rem;
        }
        
        .edugame-comparison-canvas {
          border: 4px solid;
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          max-width: 100%;
          height: auto;
        }
        
        .edugame-canvas-original {
          border-color: #667eea;
        }
        
        .edugame-canvas-user {
          border-color: #56ab2f;
        }
        
        @media (min-width: 640px) {
          .edugame-title-main {
            font-size: 2.5rem;
          }
          
          .edugame-header-bar {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          
          .edugame-header-actions {
            justify-content: flex-end;
          }
          
          .edugame-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .edugame-questions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .edugame-answers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .edugame-comparison-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .edugame-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .edugame-activity-container {
            padding: 2.5rem;
          }
        }

        @media (max-width: 639px) {
  .edugame-drawing-canvas {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 1;
  }
  
  .edugame-comparison-canvas {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 1;
  }
  
  .edugame-answer-input,
  .edugame-select-input {
    font-size: 16px !important; /* Prevents zoom on iOS */
  }
  
  .edugame-canvas-wrapper {
    overflow-x: auto;
  }
  
  .edugame-title-main {
    font-size: 1.5rem;
  }
  
  .edugame-activity-header {
    font-size: 1.5rem;
  }
}

/* Prevent text selection while drawing */
.edugame-drawing-canvas {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
      `}</style>
    </div>
  );
};

const GameMenu = ({ setCurrentGame, navigate, userId }) => {
  return (
    <div className="edugame-menu-wrapper">
      <div className="edugame-header-bar">

   




        <h1 className="edugame-title-main">Educational Games</h1>
        <div className="edugame-header-actions">
          {userId ? (
            <div className="edugame-sync-indicator">
              ✓ Data syncing
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="edugame-btn-login"
            >
              Login
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="edugame-btn-dashboard"
          >
            Dashboard
          </button>
        </div>
      </div>
      
      <div className="edugame-cards-grid">
        <GameCard
          title="Table Game"
          description="Practice multiplication tables"
          icon="📊"
          onClick={() => setCurrentGame('table')}
        />
        
        <GameCard
          title="Circle Accuracy"
          description="Draw perfect circles"
          icon="⭕"
          onClick={() => setCurrentGame('circle')}
        />
        
        <GameCard
          title="Pattern Matching"
          description="Replicate patterns on grid"
          icon="🎨"
          onClick={() => setCurrentGame('pattern')}
        />
      </div>
    </div>
  );
};

const GameCard = ({ title, description, icon, onClick }) => {
  return (
    <div onClick={onClick} className="edugame-game-card">
      <div className="edugame-card-icon">{icon}</div>
      <h3 className="edugame-card-title">{title}</h3>
      <p className="edugame-card-desc">{description}</p>
    </div>
  );
};

const TableGame = ({ setCurrentGame, updatePerformanceData }) => {
  const [gameState, setGameState] = useState('setup');
  const [difficulty, setDifficulty] = useState('single');
  const [totalTime, setTotalTime] = useState(60);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [userAnswers, setUserAnswers] = useState(Array(10).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            checkAnswers();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    let num;
    if (difficulty === 'single') num = Math.floor(Math.random() * 9) + 1; // 1-9
    else if (difficulty === 'double') num = Math.floor(Math.random() * 90) + 10; // 10-99
    else if (difficulty === 'triple') num = Math.floor(Math.random() * 900) + 100; // 100-999
    else if (difficulty === 'four') num = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    else if (difficulty === 'five') num = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
    
    setCurrentNumber(num);
    setTimeLeft(totalTime);
    setUserAnswers(Array(10).fill(''));
    setGameState('playing');
    setResult(null);
  };

  const checkAnswers = () => {
    const correctAnswers = Array(10).fill(0).map((_, i) => currentNumber * (i + 1));
    const userNumAnswers = userAnswers.map(ans => parseInt(ans) || 0);
    
    const correctCount = userNumAnswers.filter((ans, idx) => ans === correctAnswers[idx]).length;
    const accuracy = (correctCount / 10) * 100;
    const isCorrect = accuracy >= 80;
    const score = isCorrect ? 2 : -1;
    
    setResult({
      correct: isCorrect,
      accuracy: accuracy.toFixed(1),
      correctAnswers,
      correctCount,
      score
    });
    
    updatePerformanceData('tableGame', isCorrect, score, {
      difficulty,
      speed: totalTime,
      count: 10,
      totalQuestions: 10,
      correctAnswers: correctCount,
      accuracy: accuracy.toFixed(1) + '%',
      maxScore: 2
    });
    
    setGameState('result');
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  if (gameState === 'setup') {
    return (
      <div className="edugame-activity-container">
        <button onClick={() => setCurrentGame('menu')} className="edugame-back-button">
          <Home size={20} /> Back to Menu
        </button>

        <div className="avc-logo-container">
          <img 
            src={bdaLogo} 
            alt="BDA Abacus Classes Logo" 
            className="avc-logo"
          />
        </div>

        <h2 className="edugame-activity-header">Table Game</h2>

        <div className="edugame-settings-group">
          <label className="edugame-setting-label">Difficulty Level:</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="edugame-select-input">
            <option value="single">Single Digit (1-9)</option>
            <option value="double">Double Digit (10-99)</option>
            <option value="triple">Triple Digit (100-999)</option>
            <option value="four">4 Digits (1,000-9,999)</option>
            <option value="five">5 Digits (10,000-99,999)</option>
          </select>
        </div>

        <div className="edugame-settings-group">
          <label className="edugame-setting-label">Time Limit: {totalTime}s</label>
          <input type="range" min="30" max="180" step="10" value={totalTime} onChange={(e) => setTotalTime(parseInt(e.target.value))} className="edugame-range-input" />
        </div>

        <button onClick={startGame} className="edugame-btn-primary">
          <Play size={24} /> Start Game
        </button>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="edugame-activity-container">
        <div className="edugame-gameplay-header">
          <h2 className="edugame-gameplay-title">Table of {currentNumber}</h2>
          <div className={`edugame-timer-display ${timeLeft <= 10 ? 'edugame-timer-critical' : ''}`}>
            {timeLeft}s
          </div>
        </div>

        <div className="edugame-questions-grid">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="edugame-question-row">
              <span className="edugame-question-text">{currentNumber} × {i + 1} =</span>
              <input
                type="number"
                value={userAnswers[i]}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                className="edugame-answer-input"

                style={{ minWidth: 0 }} // This fixes overflow
              />
            </div>
          ))}
        </div>

        <button onClick={checkAnswers} className="edugame-btn-success">
          Submit Answers
        </button>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="edugame-activity-container">
        <h2 className="edugame-activity-header">Your Results</h2>

        <div className={`edugame-result-panel ${result.correct ? 'edugame-result-success' : 'edugame-result-failure'}`}>
          <div className="edugame-result-emoji">{result.correct ? '🎉' : '😢'}</div>
          <div className="edugame-result-status">{result.correct ? 'Excellent Work!' : 'Keep Practicing!'}</div>
          <div className="edugame-result-stats">Accuracy: {result.accuracy}% ({result.correctCount}/10)</div>
          <div className="edugame-result-score">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
        </div>

        <div className="edugame-answers-grid">
          {Array(10).fill(0).map((_, i) => {
            const isCorrect = parseInt(userAnswers[i]) === result.correctAnswers[i];
            return (
              <div key={i} className={`edugame-answer-item ${isCorrect ? 'edugame-answer-correct' : 'edugame-answer-incorrect'}`}>
                <div className="edugame-answer-header">
                  <span className="edugame-answer-equation">{currentNumber} × {i + 1} = {result.correctAnswers[i]}</span>
                  {isCorrect ? <Check className="text-green-600" /> : <X className="text-red-600" />}
                </div>
                {!isCorrect && <div className="edugame-answer-detail">Your answer: {userAnswers[i] || 'None'}</div>}
              </div>
            );
          })}
        </div>

        <div className="edugame-action-buttons">
          <button onClick={() => setGameState('setup')} className="edugame-btn-primary">
            <RefreshCw size={24} /> Play Again
          </button>
          <button onClick={() => setCurrentGame('menu')} className="edugame-btn-secondary">
            <Home size={24} /> Main Menu
          </button>
        </div>
      </div>
    );
  }
};

const CircleGame = ({ setCurrentGame, updatePerformanceData }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    setPoints([]);
    setResult(null);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setPoints([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setPoints([...points, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDrawing && points.length > 10) calculateCircleAccuracy();
    setIsDrawing(false);
  };

  const calculateCircleAccuracy = () => {
    if (points.length < 10) return;

    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const radii = points.map(p => Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2)));
    const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
    const variance = radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
    const stdDev = Math.sqrt(variance);
    const accuracy = Math.max(0, Math.min(100, 100 - (stdDev / avgRadius) * 100));
    const isCorrect = accuracy >= 70;
    const score = accuracy >= 90 ? 2 : accuracy >= 70 ? 1 : -1;

    setResult({
      accuracy: accuracy.toFixed(1),
      perfect: accuracy >= 90,
      good: accuracy >= 70,
      correct: isCorrect,
      score,
      centerX,
      centerY,
      avgRadius
    });

    updatePerformanceData('circleAccuracy', isCorrect, score, {
      difficulty: 'N/A',
      totalQuestions: 1,
      correctAnswers: isCorrect ? 1 : 0,
      accuracy: accuracy.toFixed(1) + '%',
      maxScore: 2
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, avgRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    setResult(null);
  };


  const handleTouchStart = (e) => {
  e.preventDefault();
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  setIsDrawing(true);
  setPoints([]);
  setResult(null);
  setPoints([{ x, y }]);
};

const handleTouchMove = (e) => {
  if (!isDrawing) return;
  e.preventDefault();
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  if (points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  setPoints([...points, { x, y }]);
};

const handleTouchEnd = () => {
  if (isDrawing && points.length > 10) calculateCircleAccuracy();
  setIsDrawing(false);
};
  return (
    <div className="edugame-activity-container">
      <button onClick={() => setCurrentGame('menu')} className="edugame-back-button">
        <Home size={20} /> Back to Menu
      </button>

         <div className="avc-logo-container">
                <img 
                  src={bdaLogo} 
                  alt="BDA Abacus Classes Logo" 
                  className="avc-logo"
                />
              </div>

      <h2 className="edugame-activity-header">Circle Accuracy</h2>
      
      <div className="edugame-canvas-wrapper">
        <div className="edugame-canvas-hint">Draw a perfect circle!</div>
<canvas
  ref={canvasRef}
  width={600}
  height={600}
  onMouseDown={startDrawing}
  onMouseMove={draw}
  onMouseUp={stopDrawing}
  onMouseLeave={stopDrawing}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="edugame-drawing-canvas"
  style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
/>
      </div>

      {result && (
        <div className={`edugame-result-panel ${result.perfect ? 'edugame-result-perfect' : result.good ? 'edugame-result-good' : 'edugame-result-try'}`}>
          <div className="edugame-result-emoji">{result.perfect ? '🎯' : result.good ? '👍' : '💪'}</div>
          <div className="edugame-result-status">Accuracy: {result.accuracy}%</div>
          <div className="edugame-result-stats">{result.perfect ? 'Perfect Circle!' : result.good ? 'Good Job!' : 'Keep Trying!'}</div>
          <div className="edugame-result-score">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
        </div>
      )}

      <div className="edugame-action-buttons">
        <button onClick={clearCanvas} className="edugame-btn-warning">
          <RefreshCw size={24} /> Clear Canvas
        </button>
        <button onClick={() => setCurrentGame('menu')} className="edugame-btn-secondary">
          <Home size={24} /> Main Menu
        </button>
      </div>
    </div>
  );
};
// UPDATED PATTERN GAME - Dot to Dot Connection with Live Preview
// UPDATED PATTERN GAME - Dot to Dot Connection with Live Preview
const PatternGame = ({ setCurrentGame, updatePerformanceData }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('setup');
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startDot, setStartDot] = useState(null);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [drawnLines, setDrawnLines] = useState([]);
  const [result, setResult] = useState(null);

  const patterns = [
    { name: 'Stairs', lines: [[1,5,1,3], [1,3,3,3], [3,3,3,1], [3,1,5,1]] },
    { name: 'House', lines: [[2,1,4,3], [4,3,4,5], [4,5,2,5], [2,5,2,3], [2,3,2,1]] },
    { name: 'Arrow', lines: [[3,1,1,3], [3,1,5,3], [3,1,3,5]] },
    { name: 'Star', lines: [[3,1,2,5], [3,1,4,5], [1,2,5,2], [1,4,5,4], [2,2,4,4], [2,4,4,2]] },
    { name: 'Triangle', lines: [[3,1,1,5], [3,1,5,5], [1,5,5,5]] },
    { name: 'Diamond', lines: [[3,1,1,3], [1,3,3,5], [3,5,5,3], [5,3,3,1]] },
  { name: 'Cross', lines: [[3,1,3,5], [1,3,5,3]] },
  { name: 'Rectangle', lines: [[1,1,5,1], [5,1,5,5], [5,5,1,5], [1,5,1,1]] },
  { name: 'Lightning', lines: [[2,1,3,2], [3,2,2,3], [2,3,3,4], [3,4,2,5]] },
  { name: 'Flag', lines: [[1,1,1,5], [1,1,4,2], [4,2,1,3]] },
  { name: 'Pentagon', lines: [[3,1,1,2], [1,2,1,4], [1,4,3,5], [3,5,5,4], [5,4,5,2], [5,2,3,1]] }
  ];

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            checkPattern();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && currentPattern) {
      drawGrid(canvas);
      if (gameState === 'setup') drawPattern(canvas, currentPattern.lines);
    }
  }, [currentPattern, gameState]);

  // Redraw canvas when drawing or mouse moves
  useEffect(() => {
    if (gameState === 'playing') {
      const canvas = canvasRef.current;
      if (canvas) {
        redrawCanvas();
      }
    }
  }, [drawnLines, isDrawing, startDot, currentMousePos, gameState]);

  const drawGrid = (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = canvas.width / 6;
    
    // Draw dots
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(cellSize * (i + 0.5), cellSize * (j + 0.5), 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  // Add touch support for mobile devices
const handleTouchStart = (e) => {
  if (gameState !== 'playing') return;
  e.preventDefault();
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  const dot = getNearestDot(x, y, canvas);
  
  setStartDot(dot);
  setIsDrawing(true);
  setCurrentMousePos({ x, y });
};

const handleTouchMove = (e) => {
  if (!isDrawing || gameState !== 'playing') return;
  e.preventDefault();
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  const nearestDot = getNearestDot(x, y, canvas);
  const dotPos = getDotPosition(nearestDot, canvas);
  
  setCurrentMousePos(dotPos);
};

const handleTouchEnd = (e) => {
  if (!isDrawing || !startDot || gameState !== 'playing') return;
  e.preventDefault();
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.changedTouches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  const endDot = getNearestDot(x, y, canvas);
  
  if (startDot.col !== endDot.col || startDot.row !== endDot.row) {
    const newLine = [startDot.col, startDot.row, endDot.col, endDot.row];
    setDrawnLines([...drawnLines, newLine]);
  }
  
  setIsDrawing(false);
  setStartDot(null);
  setCurrentMousePos(null);
};


{/* <canvas
  ref={canvasRef}
  width={400}
  height={400}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="edugame-drawing-canvas"
  style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
/> */}

  

  // Update the canvas in playing state to include touch events:
  // Replace the canvas element in 'playing' state with this:
  /*
  <canvas
    ref={canvasRef}
    width={400}
    height={400}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    className="edugame-drawing-canvas"
    style={{ touchAction: 'none' }}
  />
  */
};

  const drawPattern = (canvas, lines, color = '#667eea') => {
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / 6;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    lines.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(cellSize * (x1 + 0.5), cellSize * (y1 + 0.5));
      ctx.lineTo(cellSize * (x2 + 0.5), cellSize * (y2 + 0.5));
      ctx.stroke();
    });
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / 6;
    
    // Clear and draw grid
    drawGrid(canvas);
    
    // Draw completed lines
    if (drawnLines.length > 0) {
      drawPattern(canvas, drawnLines, '#56ab2f');
    }
    
    // Draw preview line while dragging
    if (isDrawing && startDot && currentMousePos) {
      ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.setLineDash([8, 4]); // Dashed line for preview
      
      ctx.beginPath();
      ctx.moveTo(cellSize * (startDot.col + 0.5), cellSize * (startDot.row + 0.5));
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
      ctx.stroke();
      
      ctx.setLineDash([]); // Reset dash
    }
    
    // Highlight start dot when dragging
    if (isDrawing && startDot) {
      ctx.fillStyle = '#667eea';
      ctx.beginPath();
      ctx.arc(
        cellSize * (startDot.col + 0.5), 
        cellSize * (startDot.row + 0.5), 
        10, 
        0, 
        2 * Math.PI
      );
      ctx.fill();
    }
  };

  const startGame = () => {
    setTimeLeft(timeLimit);
    setGameState('playing');
    setDrawnLines([]);
    setResult(null);
  };

  const getNearestDot = (x, y, canvas) => {
    const cellSize = canvas.width / 6;
    
    // Find the closest dot by checking distance to all dots
    let minDistance = Infinity;
    let nearestDot = { col: 0, row: 0 };
    
    for (let col = 0; col < 6; col++) {
      for (let row = 0; row < 6; row++) {
        const dotX = cellSize * (col + 0.5);
        const dotY = cellSize * (row + 0.5);
        const distance = Math.sqrt(Math.pow(x - dotX, 2) + Math.pow(y - dotY, 2));
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestDot = { col, row };
        }
      }
    }
    
    return nearestDot;
  };

  const getDotPosition = (dot, canvas) => {
    const cellSize = canvas.width / 6;
    return {
      x: cellSize * (dot.col + 0.5),
      y: cellSize * (dot.row + 0.5)
    };
  };

  const handleMouseDown = (e) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dot = getNearestDot(x, y, canvas);
    
    setStartDot(dot);
    setIsDrawing(true);
    setCurrentMousePos({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find nearest dot and snap preview to it
    const nearestDot = getNearestDot(x, y, canvas);
    const dotPos = getDotPosition(nearestDot, canvas);
    
    setCurrentMousePos(dotPos); // Snap to nearest dot position
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startDot || gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const endDot = getNearestDot(x, y, canvas);
    
    // Only draw if it's a different dot
    if (startDot.col !== endDot.col || startDot.row !== endDot.row) {
      const newLine = [startDot.col, startDot.row, endDot.col, endDot.row];
      setDrawnLines([...drawnLines, newLine]);
    }
    
    setIsDrawing(false);
    setStartDot(null);
    setCurrentMousePos(null);
  };

  const checkPattern = () => {
    if (!currentPattern) return;

    const normalizeLine = (line) => {
      const [x1, y1, x2, y2] = line;
      return x1 > x2 || (x1 === x2 && y1 > y2) ? [x2, y2, x1, y1] : line;
    };

    const normalizedPattern = currentPattern.lines.map(normalizeLine).sort().map(l => l.join(','));
    const normalizedDrawn = drawnLines.map(normalizeLine).sort().map(l => l.join(','));
    const matchedLines = normalizedDrawn.filter(line => normalizedPattern.includes(line)).length;
    const accuracy = (matchedLines / normalizedPattern.length) * 100;
    const isCorrect = accuracy >= 80;
    const score = isCorrect ? 2 : -1;

    setResult({
      accuracy: accuracy.toFixed(1),
      correct: isCorrect,
      matchedLines,
      totalLines: normalizedPattern.length,
      score
    });
    
    updatePerformanceData('patternMatching', isCorrect, score, {
      difficulty: currentPattern.name,
      speed: timeLimit,
      count: currentPattern.lines.length,
      totalQuestions: currentPattern.lines.length,
      correctAnswers: matchedLines,
      accuracy: accuracy.toFixed(1) + '%',
      maxScore: 2
    });
    
    setGameState('result');
  };



  const handleTouchStart = (e) => {
  if (gameState !== 'playing') return;
  e.preventDefault();
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  const dot = getNearestDot(x, y, canvas);
  
  setStartDot(dot);
  setIsDrawing(true);
  setCurrentMousePos({ x, y });
};

const handleTouchMove = (e) => {
  if (!isDrawing || gameState !== 'playing') return;
  e.preventDefault();
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  const nearestDot = getNearestDot(x, y, canvas);
  const dotPos = getDotPosition(nearestDot, canvas);
  
  setCurrentMousePos(dotPos);
};

const handleTouchEnd = (e) => {
  if (!isDrawing || !startDot || gameState !== 'playing') return;
  e.preventDefault();
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.changedTouches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  const endDot = getNearestDot(x, y, canvas);
  
  if (startDot.col !== endDot.col || startDot.row !== endDot.row) {
    const newLine = [startDot.col, startDot.row, endDot.col, endDot.row];
    setDrawnLines([...drawnLines, newLine]);
  }
  
  setIsDrawing(false);
  setStartDot(null);
  setCurrentMousePos(null);
};

  const clearDrawing = () => {
    setDrawnLines([]);
    setIsDrawing(false);
    setStartDot(null);
    setCurrentMousePos(null);
    const canvas = canvasRef.current;
    if (canvas) drawGrid(canvas);
  };

  if (gameState === 'setup') {
    return (
      <div className="edugame-activity-container">
        <button onClick={() => setCurrentGame('menu')} className="edugame-back-button">
          <Home size={20} /> Back to Menu
        </button>

           <div className="avc-logo-container">
                <img 
                  src={bdaLogo} 
                  alt="BDA Abacus Classes Logo" 
                  className="avc-logo"
                />
              </div>

        <h2 className="edugame-activity-header">Pattern Matching</h2>

        {!currentPattern ? (
          <>
            <div className="edugame-settings-group">
              <label className="edugame-setting-label">Time Limit: {timeLimit}s</label>
              <input type="range" min="30" max="120" step="10" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} className="edugame-range-input" />
            </div>
            <button
              onClick={() => setCurrentPattern(patterns[Math.floor(Math.random() * patterns.length)])}
              className="edugame-btn-primary"
            >
              Show Pattern
            </button>
          </>
        ) : (
          <>
            <div className="edugame-pattern-instruction">
              <h3 className="edugame-pattern-name">Memorize: {currentPattern.name}</h3>
              <p className="edugame-pattern-hint">Connect dots to replicate pattern - {timeLimit}s</p>
            </div>
            <div className="edugame-canvas-wrapper">
              <canvas ref={canvasRef} width={400} height={400} className="edugame-drawing-canvas" />
            </div>
            <button onClick={startGame} className="edugame-btn-success">
              <Play size={24} /> Start Drawing
            </button>
          </>
        )}
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="edugame-activity-container">
        <div className="edugame-gameplay-header">
          <h2 className="edugame-gameplay-title">Draw the Pattern</h2>
          <div className={`edugame-timer-display ${timeLeft <= 10 ? 'edugame-timer-critical' : ''}`}>
            {timeLeft}s
          </div>
        </div>

        <div className="edugame-canvas-wrapper">
          <div className="edugame-canvas-hint">Click and drag from dot to dot to connect them</div>
          <canvas
  ref={canvasRef}
  width={400}
  height={400}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="edugame-drawing-canvas"
  style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
/>
        </div>

        <div className="edugame-action-buttons">
          <button onClick={clearDrawing} className="edugame-btn-warning">
            Clear
          </button>
          <button onClick={checkPattern} className="edugame-btn-success">
            Submit
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="edugame-activity-container">
        <h2 className="edugame-activity-header">Your Results</h2>

        <div className={`edugame-result-panel ${result.correct ? 'edugame-result-success' : 'edugame-result-failure'}`}>
          <div className="edugame-result-emoji">{result.correct ? '🎉' : '😔'}</div>
          <div className="edugame-result-status">{result.correct ? 'Well Done!' : 'Keep Trying!'}</div>
          <div className="edugame-result-stats">Accuracy: {result.accuracy}%</div>
          <div className="edugame-result-stats">Matched {result.matchedLines}/{result.totalLines} lines</div>
          <div className="edugame-result-score">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
        </div>

        <div className="edugame-comparison-grid">
          <div className="edugame-comparison-item">
            <h3 className="edugame-comparison-label">Original</h3>
            <canvas
              ref={(canvas) => {
                if (canvas && currentPattern) {
                  const ctx = canvas.getContext('2d');
                  ctx.fillStyle = 'white';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  
                  const cellSize = canvas.width / 6;
                  ctx.fillStyle = '#94A3B8';
                  for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 6; j++) {
                      ctx.beginPath();
                      ctx.arc(cellSize * (i + 0.5), cellSize * (j + 0.5), 6, 0, 2 * Math.PI);
                      ctx.fill();
                    }
                  }
                  
                  ctx.strokeStyle = '#667eea';
                  ctx.lineWidth = 4;
                  ctx.lineCap = 'round';
                  ctx.lineJoin = 'round';
                  currentPattern.lines.forEach(([x1, y1, x2, y2]) => {
                    ctx.beginPath();
                    ctx.moveTo(cellSize * (x1 + 0.5), cellSize * (y1 + 0.5));
                    ctx.lineTo(cellSize * (x2 + 0.5), cellSize * (y2 + 0.5));
                    ctx.stroke();
                  });
                }
              }}
              width={300}
              height={300}
              className="edugame-comparison-canvas edugame-canvas-original"
            />
          </div>
          
          <div className="edugame-comparison-item">
            <h3 className="edugame-comparison-label">Your Drawing</h3>
            <canvas
              ref={(canvas) => {
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  ctx.fillStyle = 'white';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  
                  const cellSize = canvas.width / 6;
                  ctx.fillStyle = '#94A3B8';
                  for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 6; j++) {
                      ctx.beginPath();
                      ctx.arc(cellSize * (i + 0.5), cellSize * (j + 0.5), 6, 0, 2 * Math.PI);
                      ctx.fill();
                    }
                  }
                  
                  ctx.strokeStyle = '#56ab2f';
                  ctx.lineWidth = 4;
                  ctx.lineCap = 'round';
                  ctx.lineJoin = 'round';
                  drawnLines.forEach(([x1, y1, x2, y2]) => {
                    ctx.beginPath();
                    ctx.moveTo(cellSize * (x1 + 0.5), cellSize * (y1 + 0.5));
                    ctx.lineTo(cellSize * (x2 + 0.5), cellSize * (y2 + 0.5));
                    ctx.stroke();
                  });
                }
              }}
              width={300}
              height={300}
              className="edugame-comparison-canvas edugame-canvas-user"
            />
          </div>
        </div>

        <div className="edugame-action-buttons">
          <button
            onClick={() => {
              setGameState('setup');
              setCurrentPattern(null);
              setDrawnLines([]);
              setResult(null);
            }}
            className="edugame-btn-primary"
          >
            <RefreshCw size={24} /> Play Again
          </button>
          <button onClick={() => setCurrentGame('menu')} className="edugame-btn-secondary">
            <Home size={24} /> Main Menu
          </button>
        </div>
      </div>
    );
  }
};

// NEW SHAPE GAMES MENU
const ShapeGamesMenu = ({ setCurrentGame }) => {
  const shapeGames = [
    { id: 'circle', name: 'Circle', icon: '⭕', color: 'from-blue-400 to-blue-600' },
    { id: 'rectangle', name: 'Rectangle', icon: '▭', color: 'from-green-400 to-green-600' },
    { id: 'square', name: 'Square', icon: '◻️', color: 'from-purple-400 to-purple-600' },
    { id: 'triangle', name: 'Triangle', icon: '▲', color: 'from-orange-400 to-orange-600' },
  ];

  return (
    <div className="edugame-activity-container">
      <button onClick={() => setCurrentGame('menu')} className="edugame-back-button">
        <Home size={20} /> Back to Menu
      </button>

      <h2 className="edugame-activity-header">Choose Shape to Draw</h2>

      <div className="edugame-cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {shapeGames.map((game) => (
          <div
            key={game.id}
            onClick={() => setCurrentGame(game.id)}
            className="edugame-game-card"
            style={{ minHeight: '180px' }}
          >
            <div className="edugame-card-icon">{game.icon}</div>
            <h3 className="edugame-card-title">{game.name}</h3>
            <p className="edugame-card-desc">Draw a perfect {game.name.toLowerCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// RECTANGLE GAME
const RectangleGame = ({ setCurrentGame, updatePerformanceData }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    setPoints([]);
    setResult(null);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setPoints([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setPoints([...points, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDrawing && points.length > 20) calculateRectangleAccuracy();
    setIsDrawing(false);
  };

  const calculateRectangleAccuracy = () => {
    if (points.length < 20) return;

    // Find bounding box
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    // Check if it's rectangular (not square-ish)
    const aspectRatio = Math.max(width, height) / Math.min(width, height);
    const isRectangular = aspectRatio >= 1.3; // Should be elongated

    // Calculate how well points follow the rectangle perimeter
    const corners = [
      { x: minX, y: minY }, // top-left
      { x: maxX, y: minY }, // top-right
      { x: maxX, y: maxY }, // bottom-right
      { x: minX, y: maxY }  // bottom-left
    ];

    // Check distance from points to nearest rectangle edge
    let totalDeviation = 0;
    points.forEach(point => {
      const distToTop = Math.abs(point.y - minY);
      const distToBottom = Math.abs(point.y - maxY);
      const distToLeft = Math.abs(point.x - minX);
      const distToRight = Math.abs(point.x - maxX);
      
      const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);
      totalDeviation += minDist;
    });

    const avgDeviation = totalDeviation / points.length;
    const avgSize = (width + height) / 2;
    const deviationRatio = avgDeviation / avgSize;

    // Calculate accuracy
    let accuracy = Math.max(0, Math.min(100, 100 - (deviationRatio * 200)));
    
    // Penalty if too square-ish
    if (!isRectangular) {
      accuracy = Math.min(accuracy, 60);
    }

    const isCorrect = accuracy >= 70;
    const score = accuracy >= 90 ? 2 : accuracy >= 70 ? 1 : -1;

    setResult({
      accuracy: accuracy.toFixed(1),
      perfect: accuracy >= 90,
      good: accuracy >= 70,
      correct: isCorrect,
      score
    });

    updatePerformanceData('rectangleAccuracy', isCorrect, score, {
      difficulty: 'N/A',
      totalQuestions: 1,
      correctAnswers: isCorrect ? 1 : 0,
      accuracy: accuracy.toFixed(1) + '%',
      maxScore: 2
    });

    // Draw ideal rectangle overlay
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(minX, minY, width, height);
    ctx.setLineDash([]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    setResult(null);
  };


  const handleTouchStart = (e) => {
  e.preventDefault();
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  setIsDrawing(true);
  setPoints([]);
  setResult(null);
  setPoints([{ x, y }]);
};

const handleTouchMove = (e) => {
  if (!isDrawing) return;
  e.preventDefault();
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  if (points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  setPoints([...points, { x, y }]);
};

const handleTouchEnd = () => {
  if (isDrawing && points.length > 10) calculateRectangleAccuracy();
  setIsDrawing(false);
};

  return (
    <div className="edugame-activity-container">
      <button onClick={() => setCurrentGame('shape-menu')} className="edugame-back-button">
        <Home size={20} /> Back
      </button>

      <div className="avc-logo-container">
        <img 
          src={bdaLogo} 
          alt="BDA Abacus Classes Logo" 
          className="avc-logo"
        />
      </div>

      <h2 className="edugame-activity-header">Rectangle Accuracy</h2>
      
      <div className="edugame-canvas-wrapper">
        <div className="edugame-canvas-hint">Draw a perfect rectangle!</div>
        {/* <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="edugame-drawing-canvas"
        /> */}

        <canvas
  ref={canvasRef}
  width={600}
  height={600}
  onMouseDown={startDrawing}
  onMouseMove={draw}
  onMouseUp={stopDrawing}
  onMouseLeave={stopDrawing}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="edugame-drawing-canvas"
  style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
/>
      </div>

      {result && (
        <div className={`edugame-result-panel ${result.perfect ? 'edugame-result-perfect' : result.good ? 'edugame-result-good' : 'edugame-result-try'}`}>
          <div className="edugame-result-emoji">{result.perfect ? '🎯' : result.good ? '👍' : '💪'}</div>
          <div className="edugame-result-status">Accuracy: {result.accuracy}%</div>
          <div className="edugame-result-stats">{result.perfect ? 'Perfect Rectangle!' : result.good ? 'Good Job!' : 'Keep Trying!'}</div>
          <div className="edugame-result-score">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
        </div>
      )}

      <div className="edugame-action-buttons">
        <button onClick={clearCanvas} className="edugame-btn-warning">
          <RefreshCw size={24} /> Clear Canvas
        </button>
        <button onClick={() => setCurrentGame('shape-menu')} className="edugame-btn-secondary">
          <Home size={24} /> Shape Menu
        </button>
      </div>
    </div>
  );
};

// SQUARE GAME
const SquareGame = ({ setCurrentGame, updatePerformanceData }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    setPoints([]);
    setResult(null);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setPoints([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setPoints([...points, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDrawing && points.length > 20) calculateSquareAccuracy();
    setIsDrawing(false);
  };

  const calculateSquareAccuracy = () => {
    if (points.length < 20) return;

    // Find bounding box
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    // Check how close to square (width ≈ height)
    const difference = Math.abs(width - height);
    const averageSize = (width + height) / 2;
    const sizeRatio = difference / averageSize;

    // Calculate how well points follow the square perimeter
    let totalDeviation = 0;
    points.forEach(point => {
      const distToTop = Math.abs(point.y - minY);
      const distToBottom = Math.abs(point.y - maxY);
      const distToLeft = Math.abs(point.x - minX);
      const distToRight = Math.abs(point.x - maxX);
      
      const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);
      totalDeviation += minDist;
    });

    const avgDeviation = totalDeviation / points.length;
    const deviationRatio = avgDeviation / averageSize;

    // Calculate accuracy
    let accuracy = Math.max(0, Math.min(100, 100 - (deviationRatio * 200) - (sizeRatio * 100)));

    const isCorrect = accuracy >= 70;
    const score = accuracy >= 90 ? 2 : accuracy >= 70 ? 1 : -1;

    setResult({
      accuracy: accuracy.toFixed(1),
      perfect: accuracy >= 90,
      good: accuracy >= 70,
      correct: isCorrect,
      score
    });

    updatePerformanceData('squareAccuracy', isCorrect, score, {
      difficulty: 'N/A',
      totalQuestions: 1,
      correctAnswers: isCorrect ? 1 : 0,
      accuracy: accuracy.toFixed(1) + '%',
      maxScore: 2
    });

    // Draw ideal square overlay
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = Math.min(width, height);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(minX, minY, size, size);
    ctx.setLineDash([]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    setResult(null);
  };


  const handleTouchStart = (e) => {
  e.preventDefault();
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  setIsDrawing(true);
  setPoints([]);
  setResult(null);
  setPoints([{ x, y }]);
};

const handleTouchMove = (e) => {
  if (!isDrawing) return;
  e.preventDefault();
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  if (points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  setPoints([...points, { x, y }]);
};

const handleTouchEnd = () => {
  if (isDrawing && points.length > 10) calculateSquareAccuracy();
  setIsDrawing(false);
};

  return (
    <div className="edugame-activity-container">
      <button onClick={() => setCurrentGame('shape-menu')} className="edugame-back-button">
        <Home size={20} /> Back
      </button>

      <div className="avc-logo-container">
        <img 
          src={bdaLogo} 
          alt="BDA Abacus Classes Logo" 
          className="avc-logo"
        />
      </div>

      <h2 className="edugame-activity-header">Square Accuracy</h2>
      
      <div className="edugame-canvas-wrapper">
        <div className="edugame-canvas-hint">Draw a perfect square!</div>
        {/* <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="edugame-drawing-canvas"
        /> */}

        <canvas
  ref={canvasRef}
  width={600}
  height={600}
  onMouseDown={startDrawing}
  onMouseMove={draw}
  onMouseUp={stopDrawing}
  onMouseLeave={stopDrawing}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="edugame-drawing-canvas"
  style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
/>
      </div>

      {result && (
        <div className={`edugame-result-panel ${result.perfect ? 'edugame-result-perfect' : result.good ? 'edugame-result-good' : 'edugame-result-try'}`}>
          <div className="edugame-result-emoji">{result.perfect ? '🎯' : result.good ? '👍' : '💪'}</div>
          <div className="edugame-result-status">Accuracy: {result.accuracy}%</div>
          <div className="edugame-result-stats">{result.perfect ? 'Perfect Square!' : result.good ? 'Good Job!' : 'Keep Trying!'}</div>
          <div className="edugame-result-score">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
        </div>
      )}

      <div className="edugame-action-buttons">
        <button onClick={clearCanvas} className="edugame-btn-warning">
          <RefreshCw size={24} /> Clear Canvas
        </button>
        <button onClick={() => setCurrentGame('shape-menu')} className="edugame-btn-secondary">
          <Home size={24} /> Shape Menu
        </button>
      </div>
    </div>
  );
};

// TRIANGLE GAME
const TriangleGame = ({ setCurrentGame, updatePerformanceData }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    setPoints([]);
    setResult(null);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setPoints([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setPoints([...points, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDrawing && points.length > 20) calculateTriangleAccuracy();
    setIsDrawing(false);
  };

  const calculateTriangleAccuracy = () => {
    if (points.length < 20) return;

    // Find the 3 extreme points (likely triangle corners)
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    
    // Top point (minimum y)
    const topIdx = ys.indexOf(Math.min(...ys));
    const topPoint = points[topIdx];
    
    // Bottom-left point (minimum x among lower half)
    const lowerHalf = points.filter(p => p.y > topPoint.y);
    const leftIdx = lowerHalf.findIndex(p => p.x === Math.min(...lowerHalf.map(pt => pt.x)));
    const leftPoint = lowerHalf[leftIdx];
    
    // Bottom-right point (maximum x among lower half)
    const rightIdx = lowerHalf.findIndex(p => p.x === Math.max(...lowerHalf.map(pt => pt.x)));
    const rightPoint = lowerHalf[rightIdx];

    // Calculate triangle formed by these 3 points
    const corners = [topPoint, leftPoint, rightPoint];

    // Calculate side lengths
    const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const side1 = dist(corners[0], corners[1]);
    const side2 = dist(corners[1], corners[2]);
    const side3 = dist(corners[2], corners[0]);
    
    const sides = [side1, side2, side3].sort((a, b) => a - b);
    
    // Check if it's a valid triangle
    const isValidTriangle = sides[0] + sides[1] > sides[2];
    
    if (!isValidTriangle) {
      setResult({
        accuracy: 0,
        perfect: false,
        good: false,
        correct: false,
        score: -1
      });
      updatePerformanceData('triangleAccuracy', false, -1, {
        difficulty: 'N/A',
        totalQuestions: 1,
        correctAnswers: 0,
        accuracy: '0%',
        maxScore: 2
      });
      return;
    }

    // Calculate how well drawn points follow the triangle edges
    let totalDeviation = 0;
    
    points.forEach(point => {
      // Calculate distance from point to each of the 3 triangle sides
      const distToSide1 = pointToLineDistance(point, corners[0], corners[1]);
      const distToSide2 = pointToLineDistance(point, corners[1], corners[2]);
      const distToSide3 = pointToLineDistance(point, corners[2], corners[0]);
      
      const minDist = Math.min(distToSide1, distToSide2, distToSide3);
      totalDeviation += minDist;
    });

    const avgDeviation = totalDeviation / points.length;
    const avgSideLength = (side1 + side2 + side3) / 3;
    const deviationRatio = avgDeviation / avgSideLength;

    // Calculate how close to equilateral
    const avgSide = (side1 + side2 + side3) / 3;
    const variance = (Math.pow(side1 - avgSide, 2) + Math.pow(side2 - avgSide, 2) + Math.pow(side3 - avgSide, 2)) / 3;
    const stdDev = Math.sqrt(variance);
    const symmetryRatio = stdDev / avgSide;

    // Calculate accuracy
    let accuracy = Math.max(0, Math.min(100, 100 - (deviationRatio * 150) - (symmetryRatio * 50)));

    const isCorrect = accuracy >= 60;
    const score = accuracy >= 85 ? 2 : accuracy >= 60 ? 1 : -1;

    setResult({
      accuracy: accuracy.toFixed(1),
      perfect: accuracy >= 85,
      good: accuracy >= 60,
      correct: isCorrect,
      score
    });

    updatePerformanceData('triangleAccuracy', isCorrect, score, {
      difficulty: 'N/A',
      totalQuestions: 1,
      correctAnswers: isCorrect ? 1 : 0,
      accuracy: accuracy.toFixed(1) + '%',
      maxScore: 2
    });

    // Draw ideal triangle overlay
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Helper function: calculate distance from point to line segment
  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    setResult(null);
  };

  const handleTouchStart = (e) => {
  e.preventDefault();
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  setIsDrawing(true);
  setPoints([]);
  setResult(null);
  setPoints([{ x, y }]);
};

const handleTouchMove = (e) => {
  if (!isDrawing) return;
  e.preventDefault();
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  if (points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  setPoints([...points, { x, y }]);
};

const handleTouchEnd = () => {
  if (isDrawing && points.length > 10) calculateTriangleAccuracy();
  setIsDrawing(false);
};

  return (
    <div className="edugame-activity-container">
      <button onClick={() => setCurrentGame('shape-menu')} className="edugame-back-button">
        <Home size={20} /> Back
      </button>

      <div className="avc-logo-container">
        <img 
          src={bdaLogo} 
          alt="BDA Abacus Classes Logo" 
          className="avc-logo"
        />
      </div>

      <h2 className="edugame-activity-header">Triangle Accuracy</h2>
      
      <div className="edugame-canvas-wrapper">
        <div className="edugame-canvas-hint">Draw a perfect triangle!</div>
        {/* <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="edugame-drawing-canvas"
        /> */}

        <canvas
  ref={canvasRef}
  width={600}
  height={600}
  onMouseDown={startDrawing}
  onMouseMove={draw}
  onMouseUp={stopDrawing}
  onMouseLeave={stopDrawing}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="edugame-drawing-canvas"
  style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
/>
      </div>

      {result && (
        <div className={`edugame-result-panel ${result.perfect ? 'edugame-result-perfect' : result.good ? 'edugame-result-good' : 'edugame-result-try'}`}>
          <div className="edugame-result-emoji">{result.perfect ? '🎯' : result.good ? '👍' : '💪'}</div>
          <div className="edugame-result-status">Accuracy: {result.accuracy}%</div>
          <div className="edugame-result-stats">{result.perfect ? 'Perfect Triangle!' : result.good ? 'Good Job!' : 'Keep Trying!'}</div>
          <div className="edugame-result-score">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
        </div>
      )}

      <div className="edugame-action-buttons">
        <button onClick={clearCanvas} className="edugame-btn-warning">
          <RefreshCw size={24} /> Clear Canvas
        </button>
        <button onClick={() => setCurrentGame('shape-menu')} className="edugame-btn-secondary">
          <Home size={24} /> Shape Menu
        </button>
      </div>
    </div>
  );
};

// Update the main GameMenu to include shape games option
const UpdatedGameMenu = ({ setCurrentGame, navigate, userId }) => {
  return (
    <div className="edugame-menu-wrapper">
      <div className="edugame-header-bar">

           <div className="avc-logo-container">
                <img 
                  src={bdaLogo} 
                  alt="BDA Abacus Classes Logo" 
                  className="avc-logo"
                />
              </div>
        <h1 className="edugame-title-main">Educational Games</h1>
        <div className="edugame-header-actions">
          {userId ? (
            <div className="edugame-sync-indicator">
              ✓ Data syncing
            </div>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="edugame-btn-login"
            >
              Login
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="edugame-btn-dashboard"
          >
            Dashboard
          </button>
        </div>
      </div>
      
      <div className="edugame-cards-grid">
        <GameCard
          title="Table Game"
          description="Practice multiplication tables"
          icon="📊"
          onClick={() => setCurrentGame('table')}
        />
        
        <GameCard
          title="Shape Drawing"
          description="Draw perfect shapes"
          icon="🔷"
          onClick={() => setCurrentGame('shape-menu')}
        />
        
        <GameCard
          title="Pattern Matching"
          description="Replicate patterns on grid"
          icon="🎨"
          onClick={() => setCurrentGame('pattern')}
        />
      </div>
    </div>
  );
};

export default ThreeGames;

// import React, { useState, useRef, useEffect } from 'react';
// import { Home, Check, X, RefreshCw, Play } from 'lucide-react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const ThreeGames = () => {
//   const [currentGame, setCurrentGame] = useState('menu');
//   const [userId, setUserId] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [performanceData, setPerformanceData] = useState({
//     totalGames: 0,
//     totalCorrect: 0,
//     totalScore: 0,
//     gameTypes: {},
//     dailyStats: {},
//     history: []
//   });
  
//   const navigate = useNavigate();
//   const API_URL = 'http://localhost:5000/api';

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');

//     if (token) {
//       axios.get(`${API_URL}/auth/verify`, {
//         headers: { 
//           Authorization: `${token}`,
//           'X-Device-Id': deviceId 
//         }
//       })
//       .then(response => {
//         setUserId(response.data.userId);
//         fetchUserData(response.data.userId);
//       })
//       .catch(err => {
//         console.error("Authentication error:", err);
//         localStorage.removeItem('token');
//         setIsLoading(false);
//         loadLocalData();
//       });
//     } else {
//       loadLocalData();
//       setIsLoading(false);
//     }
//   }, []);

//   const loadLocalData = () => {
//     const savedData = localStorage.getItem('threeGamesPerformance');
//     if (savedData) {
//       try {
//         setPerformanceData(JSON.parse(savedData));
//       } catch (e) {
//         console.error("Error parsing saved performance data", e);
//       }
//     }
//   };

//   const fetchUserData = (uid) => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');

//     setIsLoading(true);
//     axios.get(`${API_URL}/performance/${uid}`, {
//       headers: { 
//         Authorization: `${token}`,
//         'X-Device-Id': deviceId 
//       }
//     })
//     .then(response => {
//       if (response.data) {
//         setPerformanceData(response.data);
//       }
//       setIsLoading(false);
//     })
//     .catch(err => {
//       console.error("Error fetching user data:", err);
//       setError("Could not load your data. Using local data instead.");
//       loadLocalData();
//       setIsLoading(false);
//     });
//   };

//   useEffect(() => {
//     if (isLoading) return;
    
//     localStorage.setItem('threeGamesPerformance', JSON.stringify(performanceData));
    
//     const deviceId = localStorage.getItem('deviceId');
//     if (userId) {
//       const timerId = setTimeout(() => {
//         axios.post(`${API_URL}/performance/${userId}`, performanceData, {
//           headers: { 
//             'Content-Type': 'application/json',
//             'Authorization': `${localStorage.getItem('token')}`,
//             'X-Device-Id': deviceId
//           }
//         })
//         .then(response => {
//           console.log("Successfully saved to server:", response.data);
//         })
//         .catch(err => {
//           console.error("Error saving data to server:", err);
//         });
//       }, 2000);
      
//       return () => clearTimeout(timerId);
//     }
//   }, [performanceData, userId, isLoading]);

//   const getCurrentDateString = () => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
//   };

//   const updatePerformanceData = (gameType, correct, score, additionalData = {}) => {
//     const today = getCurrentDateString();
    
//     setPerformanceData(prevData => {
//       const newData = JSON.parse(JSON.stringify(prevData));
      
//       newData.totalGames = (newData.totalGames || 0) + 1;
//       newData.totalCorrect = (newData.totalCorrect || 0) + (correct ? 1 : 0);
//       newData.totalScore = (newData.totalScore || 0) + score;
      
//       if (!newData.gameTypes[gameType]) {
//         newData.gameTypes[gameType] = {
//           plays: 0,
//           correct: 0,
//           score: 0,
//           totalQuestions: 0,
//           correctAnswers: 0
//         };
//       }
//       newData.gameTypes[gameType].plays += 1;
//       newData.gameTypes[gameType].correct += correct ? 1 : 0;
//       newData.gameTypes[gameType].score += score;
//       newData.gameTypes[gameType].totalQuestions += (additionalData.totalQuestions || 1);
//       newData.gameTypes[gameType].correctAnswers += (additionalData.correctAnswers || (correct ? 1 : 0));
      
//       if (!newData.dailyStats[today]) {
//         newData.dailyStats[today] = {
//           plays: 0,
//           correct: 0,
//           score: 0,
//           totalQuestions: 0,
//           correctAnswers: 0,
//           gameTypes: {}
//         };
//       }
//       newData.dailyStats[today].plays += 1;
//       newData.dailyStats[today].correct += correct ? 1 : 0;
//       newData.dailyStats[today].score += score;
//       newData.dailyStats[today].totalQuestions += (additionalData.totalQuestions || 1);
//       newData.dailyStats[today].correctAnswers += (additionalData.correctAnswers || (correct ? 1 : 0));
      
//       if (!newData.dailyStats[today].gameTypes[gameType]) {
//         newData.dailyStats[today].gameTypes[gameType] = {
//           plays: 0,
//           correct: 0,
//           score: 0,
//           totalQuestions: 0,
//           correctAnswers: 0
//         };
//       }
//       newData.dailyStats[today].gameTypes[gameType].plays += 1;
//       newData.dailyStats[today].gameTypes[gameType].correct += correct ? 1 : 0;
//       newData.dailyStats[today].gameTypes[gameType].score += score;
//       newData.dailyStats[today].gameTypes[gameType].totalQuestions += (additionalData.totalQuestions || 1);
//       newData.dailyStats[today].gameTypes[gameType].correctAnswers += (additionalData.correctAnswers || (correct ? 1 : 0));
      
//       newData.history = newData.history || [];
//       newData.history.unshift({
//         date: today,
//         timestamp: new Date().toISOString(),
//         gameType,
//         difficulty: additionalData.difficulty || 'N/A',
//         speed: additionalData.speed || 0,
//         count: additionalData.count || 1,
//         correct,
//         score,
//         maxScore: additionalData.maxScore || score,
//         totalQuestions: additionalData.totalQuestions || 1,
//         correctAnswers: additionalData.correctAnswers || (correct ? 1 : 0),
//         accuracy: additionalData.accuracy || (correct ? '100%' : '0%'),
//         userId
//       });
      
//       if (newData.history.length > 100) {
//         newData.history = newData.history.slice(0, 100);
//       }
      
//       return newData;
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
//         <div className="text-2xl font-bold text-gray-700">Loading...</div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
//       {error && (
//         <div className="max-w-4xl mx-auto mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//           <button onClick={() => setError(null)} className="float-right font-bold">×</button>
//         </div>
//       )}
      
//       {currentGame === 'menu' && <GameMenu setCurrentGame={setCurrentGame} navigate={navigate} userId={userId} />}
//       {currentGame === 'table' && <TableGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
//       {currentGame === 'circle' && <CircleGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
//       {currentGame === 'pattern' && <PatternGame setCurrentGame={setCurrentGame} updatePerformanceData={updatePerformanceData} />}
//     </div>
//   );
// };

// const GameMenu = ({ setCurrentGame, navigate, userId }) => {
//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-4xl font-bold text-gray-800">Educational Games</h1>
//         <div className="flex gap-4">
//           {userId ? (
//             <div className="text-sm text-green-600 flex items-center gap-2">
//               ✓ Data syncing
//             </div>
//           ) : (
//             <button
//               onClick={() => navigate('/login')}
//               className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-sm"
//             >
//               Login
//             </button>
//           )}
//           <button
//             onClick={() => navigate('/')}
//             className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm"
//           >
//             Dashboard
//           </button>
//         </div>
//       </div>
      
//       <div className="grid md:grid-cols-3 gap-6">
//         <GameCard
//           title="Table Game"
//           description="Practice multiplication tables"
//           icon="📊"
//           onClick={() => setCurrentGame('table')}
//           color="from-blue-400 to-blue-600"
//         />
        
//         <GameCard
//           title="Circle Accuracy"
//           description="Draw perfect circles"
//           icon="⭕"
//           onClick={() => setCurrentGame('circle')}
//           color="from-green-400 to-green-600"
//         />
        
//         <GameCard
//           title="Pattern Matching"
//           description="Replicate patterns on grid"
//           icon="🎨"
//           onClick={() => setCurrentGame('pattern')}
//           color="from-purple-400 to-purple-600"
//         />
//       </div>
//     </div>
//   );
// };

// const GameCard = ({ title, description, icon, onClick, color }) => {
//   return (
//     <div
//       onClick={onClick}
//       className={`bg-gradient-to-br ${color} rounded-xl p-6 cursor-pointer transform transition hover:scale-105 hover:shadow-xl text-white`}
//     >
//       <div className="text-6xl mb-4 text-center">{icon}</div>
//       <h3 className="text-2xl font-bold mb-2 text-center">{title}</h3>
//       <p className="text-center text-white/90">{description}</p>
//     </div>
//   );
// };

// // TABLE GAME
// const TableGame = ({ setCurrentGame, updatePerformanceData }) => {
//   const [gameState, setGameState] = useState('setup');
//   const [difficulty, setDifficulty] = useState('single');
//   const [totalTime, setTotalTime] = useState(60);
//   const [currentNumber, setCurrentNumber] = useState(null);
//   const [userAnswers, setUserAnswers] = useState(Array(10).fill(''));
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [result, setResult] = useState(null);

//   useEffect(() => {
//     if (gameState === 'playing' && timeLeft > 0) {
//       const timer = setInterval(() => {
//         setTimeLeft(prev => {
//           if (prev <= 1) {
//             clearInterval(timer);
//             checkAnswers();
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       return () => clearInterval(timer);
//     }
//   }, [gameState, timeLeft]);

//   const startGame = () => {
//     let num;
//     if (difficulty === 'single') num = Math.floor(Math.random() * 9) + 1;
//     else if (difficulty === 'double') num = Math.floor(Math.random() * 90) + 10;
//     else num = Math.floor(Math.random() * 900) + 100;
    
//     setCurrentNumber(num);
//     setTimeLeft(totalTime);
//     setUserAnswers(Array(10).fill(''));
//     setGameState('playing');
//     setResult(null);
//   };

//   const checkAnswers = () => {
//     const correctAnswers = Array(10).fill(0).map((_, i) => currentNumber * (i + 1));
//     const userNumAnswers = userAnswers.map(ans => parseInt(ans) || 0);
    
//     const correctCount = userNumAnswers.filter((ans, idx) => ans === correctAnswers[idx]).length;
//     const accuracy = (correctCount / 10) * 100;
//     const isCorrect = accuracy >= 80;
//     const score = isCorrect ? 2 : -1;
    
//     setResult({
//       correct: isCorrect,
//       accuracy: accuracy.toFixed(1),
//       correctAnswers,
//       correctCount,
//       score
//     });
    
//     updatePerformanceData('tableGame', isCorrect, score, {
//       difficulty,
//       speed: totalTime,
//       count: 10,
//       totalQuestions: 10,
//       correctAnswers: correctCount,
//       accuracy: accuracy.toFixed(1) + '%',
//       maxScore: 2
//     });
    
//     setGameState('result');
//   };

//   const handleAnswerChange = (index, value) => {
//     const newAnswers = [...userAnswers];
//     newAnswers[index] = value;
//     setUserAnswers(newAnswers);
//   };

//   if (gameState === 'setup') {
//     return (
//       <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
//         <button onClick={() => setCurrentGame('menu')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
//           <Home size={20} /> Back
//         </button>

//         <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Table Game</h2>

//         <div className="space-y-6">
//           <div>
//             <label className="block text-lg font-semibold mb-2">Difficulty:</label>
//             <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-3 border-2 rounded-lg">
//               <option value="single">Single (1-9)</option>
//               <option value="double">Double (10-99)</option>
//               <option value="triple">Triple (100-999)</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-lg font-semibold mb-2">Time: {totalTime}s</label>
//             <input type="range" min="30" max="180" step="10" value={totalTime} onChange={(e) => setTotalTime(parseInt(e.target.value))} className="w-full" />
//           </div>

//           <button onClick={startGame} className="w-full bg-blue-500 text-white py-4 rounded-lg font-bold hover:bg-blue-600 flex items-center justify-center gap-2">
//             <Play size={24} /> Start
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (gameState === 'playing') {
//     return (
//       <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
//         <div className="mb-6 flex justify-between items-center">
//           <h2 className="text-3xl font-bold">Table of {currentNumber}</h2>
//           <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
//             {timeLeft}s
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4 mb-6">
//           {Array(10).fill(0).map((_, i) => (
//             <div key={i} className="flex items-center gap-3">
//               <span className="text-xl font-semibold w-32">{currentNumber} × {i + 1} =</span>
//               <input
//                 type="number"
//                 value={userAnswers[i]}
//                 onChange={(e) => handleAnswerChange(i, e.target.value)}
//                 className="flex-1 p-3 border-2 rounded-lg"
//               />
//             </div>
//           ))}
//         </div>

//         <button onClick={checkAnswers} className="w-full bg-green-500 text-white py-4 rounded-lg font-bold hover:bg-green-600">
//           Submit
//         </button>
//       </div>
//     );
//   }

//   if (gameState === 'result') {
//     return (
//       <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
//         <h2 className="text-3xl font-bold mb-6 text-center">Results</h2>

//         <div className={`text-center mb-6 p-6 rounded-lg ${result.correct ? 'bg-green-100' : 'bg-red-100'}`}>
//           <div className="text-6xl mb-4">{result.correct ? '🎉' : '😔'}</div>
//           <div className="text-2xl font-bold mb-2">{result.correct ? 'Excellent!' : 'Keep Practicing!'}</div>
//           <div className="text-xl">Accuracy: {result.accuracy}% ({result.correctCount}/10)</div>
//           <div className="text-lg mt-2">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
//         </div>

//         <div className="grid grid-cols-2 gap-4 mb-6">
//           {Array(10).fill(0).map((_, i) => {
//             const isCorrect = parseInt(userAnswers[i]) === result.correctAnswers[i];
//             return (
//               <div key={i} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
//                 <div className="flex justify-between">
//                   <span>{currentNumber} × {i + 1} = {result.correctAnswers[i]}</span>
//                   {isCorrect ? <Check className="text-green-600" /> : <X className="text-red-600" />}
//                 </div>
//                 {!isCorrect && <div className="text-sm text-gray-600">Your: {userAnswers[i] || 'None'}</div>}
//               </div>
//             );
//           })}
//         </div>

//         <div className="flex gap-4">
//           <button onClick={() => setGameState('setup')} className="flex-1 bg-blue-500 text-white py-4 rounded-lg font-bold hover:bg-blue-600 flex items-center justify-center gap-2">
//             <RefreshCw size={24} /> Again
//           </button>
//           <button onClick={() => setCurrentGame('menu')} className="flex-1 bg-gray-500 text-white py-4 rounded-lg font-bold hover:bg-gray-600 flex items-center justify-center gap-2">
//             <Home size={24} /> Menu
//           </button>
//         </div>
//       </div>
//     );
//   }
// };

// // CIRCLE GAME
// const CircleGame = ({ setCurrentGame, updatePerformanceData }) => {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [points, setPoints] = useState([]);
//   const [result, setResult] = useState(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext('2d');
//       ctx.fillStyle = 'white';
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//     }
//   }, []);

//   const startDrawing = (e) => {
//     setIsDrawing(true);
//     setPoints([]);
//     setResult(null);
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     setPoints([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
//   };

//   const draw = (e) => {
//     if (!isDrawing) return;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     ctx.strokeStyle = '#3B82F6';
//     ctx.lineWidth = 3;
//     ctx.lineCap = 'round';

//     if (points.length > 0) {
//       ctx.beginPath();
//       ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
//       ctx.lineTo(x, y);
//       ctx.stroke();
//     }
//     setPoints([...points, { x, y }]);
//   };

//   const stopDrawing = () => {
//     if (isDrawing && points.length > 10) calculateCircleAccuracy();
//     setIsDrawing(false);
//   };

//   const calculateCircleAccuracy = () => {
//     if (points.length < 10) return;

//     const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
//     const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
//     const radii = points.map(p => Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2)));
//     const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
//     const variance = radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
//     const stdDev = Math.sqrt(variance);
//     const accuracy = Math.max(0, Math.min(100, 100 - (stdDev / avgRadius) * 100));
//     const isCorrect = accuracy >= 70;
//     const score = accuracy >= 90 ? 2 : accuracy >= 70 ? 1 : -1;

//     setResult({
//       accuracy: accuracy.toFixed(1),
//       perfect: accuracy >= 90,
//       good: accuracy >= 70,
//       correct: isCorrect,
//       score,
//       centerX,
//       centerY,
//       avgRadius
//     });

//     updatePerformanceData('circleAccuracy', isCorrect, score, {
//       difficulty: 'N/A',
//       totalQuestions: 1,
//       correctAnswers: isCorrect ? 1 : 0,
//       accuracy: accuracy.toFixed(1) + '%',
//       maxScore: 2
//     });

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
//     ctx.lineWidth = 2;
//     ctx.setLineDash([5, 5]);
//     ctx.beginPath();
//     ctx.arc(centerX, centerY, avgRadius, 0, 2 * Math.PI);
//     ctx.stroke();
//     ctx.setLineDash([]);
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.fillStyle = 'white';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     setPoints([]);
//     setResult(null);
//   };

//   return (
//     <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
//       <button onClick={() => setCurrentGame('menu')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
//         <Home size={20} /> Back
//       </button>

//       <h2 className="text-3xl font-bold mb-6 text-center">Circle Accuracy</h2>
//       <div className="mb-6 text-center text-gray-600">Draw a perfect circle!</div>

//       <canvas
//         ref={canvasRef}
//         width={600}
//         height={600}
//         onMouseDown={startDrawing}
//         onMouseMove={draw}
//         onMouseUp={stopDrawing}
//         onMouseLeave={stopDrawing}
//         className="border-4 border-gray-300 rounded-lg cursor-crosshair mx-auto block bg-white mb-6"
//       />

//       {result && (
//         <div className={`mb-6 p-6 rounded-lg text-center ${result.perfect ? 'bg-green-100' : result.good ? 'bg-yellow-100' : 'bg-orange-100'}`}>
//           <div className="text-5xl mb-3">{result.perfect ? '🎯' : result.good ? '👍' : '💪'}</div>
//           <div className="text-2xl font-bold mb-2">Accuracy: {result.accuracy}%</div>
//           <div className="text-lg">{result.perfect ? 'Perfect!' : result.good ? 'Good!' : 'Keep Trying!'}</div>
//           <div className="text-lg mt-2">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
//         </div>
//       )}

//       <div className="flex gap-4">
//         <button onClick={clearCanvas} className="flex-1 bg-orange-500 text-white py-4 rounded-lg font-bold hover:bg-orange-600 flex items-center justify-center gap-2">
//           <RefreshCw size={24} /> Clear
//         </button>
//         <button onClick={() => setCurrentGame('menu')} className="flex-1 bg-gray-500 text-white py-4 rounded-lg font-bold hover:bg-gray-600 flex items-center justify-center gap-2">
//           <Home size={24} /> Menu
//         </button>
//       </div>
//     </div>
//   );
// };

// // PATTERN GAME
// const PatternGame = ({ setCurrentGame, updatePerformanceData }) => {
//   const canvasRef = useRef(null);
//   const [gameState, setGameState] = useState('setup');
//   const [timeLimit, setTimeLimit] = useState(60);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [currentPattern, setCurrentPattern] = useState(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [lastPoint, setLastPoint] = useState(null);
//   const [drawnLines, setDrawnLines] = useState([]);
//   const [result, setResult] = useState(null);

//   const patterns = [
//     { name: 'Stairs', lines: [[1,5,1,3], [1,3,3,3], [3,3,3,1], [3,1,5,1]] },
//     { name: 'House', lines: [[2,1,4,3], [4,3,4,5], [4,5,2,5], [2,5,2,3], [2,3,2,1]] },
//     { name: 'Arrow', lines: [[3,1,1,3], [3,1,5,3], [3,1,3,5]] },
//     { name: 'Star', lines: [[3,1,2,5], [3,1,4,5], [1,2,5,2], [1,4,5,4], [2,2,4,4], [2,4,4,2]] },
//     { name: 'Triangle', lines: [[3,1,1,5], [3,1,5,5], [1,5,5,5]] },
//   ];

//   useEffect(() => {
//     if (gameState === 'playing' && timeLeft > 0) {
//       const timer = setInterval(() => {
//         setTimeLeft(prev => {
//           if (prev <= 1) {
//             clearInterval(timer);
//             checkPattern();
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       return () => clearInterval(timer);
//     }
//   }, [gameState, timeLeft]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas && currentPattern) {
//       drawGrid(canvas);
//       if (gameState === 'setup') drawPattern(canvas, currentPattern.lines);
//     }
//   }, [currentPattern, gameState]);

//   const drawGrid = (canvas) => {
//     const ctx = canvas.getContext('2d');
//     ctx.fillStyle = 'white';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
    
//     const cellSize = canvas.width / 6;
//     ctx.fillStyle = '#CBD5E1';
//     for (let i = 0; i < 6; i++) {
//       for (let j = 0; j < 6; j++) {
//         ctx.beginPath();
//         ctx.arc(cellSize * (i + 0.5), cellSize * (j + 0.5), 4, 0, 2 * Math.PI);
//         ctx.fill();
//       }
//     }
//   };

//   const drawPattern = (canvas, lines, color = '#3B82F6') => {
//     const ctx = canvas.getContext('2d');
//     const cellSize = canvas.width / 6;
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 3;
//     ctx.lineCap = 'round';
//     lines.forEach(([x1, y1, x2, y2]) => {
//       ctx.beginPath();
//       ctx.moveTo(cellSize * x1, cellSize * y1);
//       ctx.lineTo(cellSize * x2, cellSize * y2);
//       ctx.stroke();
//     });
//   };

//   const startGame = () => {
//     setTimeLeft(timeLimit);
//     setGameState('playing');
//     setDrawnLines([]);
//     setResult(null);
//   };

//   const getGridPoint = (x, y, canvas) => {
//     const cellSize = canvas.width / 6;
//     return { x: Math.round(x / cellSize), y: Math.round(y / cellSize) };
//   };

//   const handleMouseDown = (e) => {
//     if (gameState !== 'playing') return;
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const point = getGridPoint(e.clientX - rect.left, e.clientY - rect.top, canvas);
//     setIsDrawing(true);
//     setLastPoint(point);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing || gameState !== 'playing') return;
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const point = getGridPoint(e.clientX - rect.left, e.clientY - rect.top, canvas);
    
//     if (point.x !== lastPoint.x || point.y !== lastPoint.y) {
//       const newLines = [...drawnLines, [lastPoint.x, lastPoint.y, point.x, point.y]];
//       setDrawnLines(newLines);
//       drawGrid(canvas);
//       drawPattern(canvas, newLines, '#10B981');
//       setLastPoint(point);
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//     setLastPoint(null);
//   };

//   const checkPattern = () => {
//     if (!currentPattern) return;

//     const normalizeLine = (line) => {
//       const [x1, y1, x2, y2] = line;
//       return x1 > x2 || (x1 === x2 && y1 > y2) ? [x2, y2, x1, y1] : line;
//     };

//     const normalizedPattern = currentPattern.lines.map(normalizeLine).sort().map(l => l.join(','));
//     const normalizedDrawn = drawnLines.map(normalizeLine).sort().map(l => l.join(','));
//     const matchedLines = normalizedDrawn.filter(line => normalizedPattern.includes(line)).length;
//     const accuracy = (matchedLines / normalizedPattern.length) * 100;
//     const isCorrect = accuracy >= 80;
//     const score = isCorrect ? 2 : -1;

//     setResult({
//       accuracy: accuracy.toFixed(1),
//       correct: isCorrect,
//       matchedLines,
//       totalLines: normalizedPattern.length,
//       score
//     });
    
//     updatePerformanceData('patternMatching', isCorrect, score, {
//       difficulty: currentPattern.name,
//       speed: timeLimit,
//       count: currentPattern.lines.length,
//       totalQuestions: currentPattern.lines.length,
//       correctAnswers: matchedLines,
//       accuracy: accuracy.toFixed(1) + '%',
//       maxScore: 2
//     });
    
//     setGameState('result');
//   };

//   const clearDrawing = () => {
//     setDrawnLines([]);
//     const canvas = canvasRef.current;
//     if (canvas) drawGrid(canvas);
//   };

//   if (gameState === 'setup') {
//     return (
//       <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
//         <button onClick={() => setCurrentGame('menu')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
//           <Home size={20} /> Back
//         </button>

//         <h2 className="text-3xl font-bold mb-6 text-center">Pattern Matching</h2>

//         {!currentPattern ? (
//           <>
//             <div className="mb-6">
//               <label className="block text-lg font-semibold mb-2">Time: {timeLimit}s</label>
//               <input type="range" min="30" max="120" step="10" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} className="w-full" />
//             </div>
//             <button
//               onClick={() => setCurrentPattern(patterns[Math.floor(Math.random() * patterns.length)])}
//               className="w-full bg-purple-500 text-white py-4 rounded-lg font-bold hover:bg-purple-600"
//             >
//               Show Pattern
//             </button>
//           </>
//         ) : (
//           <>
//             <div className="text-center mb-6">
//               <h3 className="text-2xl font-bold mb-4">Memorize: {currentPattern.name}</h3>
//               <p className="text-gray-600">You have {timeLimit}s to replicate it</p>
//             </div>
//             <canvas ref={canvasRef} width={400} height={400} className="border-4 border-gray-300 rounded-lg mx-auto block mb-6" />
//             <button onClick={startGame} className="w-full bg-green-500 text-white py-4 rounded-lg font-bold hover:bg-green-600 flex items-center justify-center gap-2">
//               <Play size={24} /> Start Drawing
//             </button>
//           </>
//         )}
//       </div>
//     );
//   }

//   if (gameState === 'playing') {
//     return (
//       <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
//         <div className="mb-6 flex justify-between items-center">
//           <h2 className="text-3xl font-bold">Draw the Pattern</h2>
//           <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
//             {timeLeft}s
//           </div>
//         </div>

//         <div className="text-center mb-4 text-gray-600">Click and drag to connect dots</div>

//         <canvas
//           ref={canvasRef}
//           width={400}
//           height={400}
//           onMouseDown={handleMouseDown}
//           onMouseMove={handleMouseMove}
//           onMouseUp={handleMouseUp}
//           onMouseLeave={handleMouseUp}
//           className="border-4 border-gray-300 rounded-lg cursor-crosshair mx-auto block mb-6"
//         />

//         <div className="flex gap-4">
//           <button onClick={clearDrawing} className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600">
//             Clear
//           </button>
//           <button onClick={checkPattern} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600">
//             Submit
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (gameState === 'result') {
//     return (
//       <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
//         <h2 className="text-3xl font-bold mb-6 text-center">Results</h2>

//         <div className={`text-center mb-6 p-6 rounded-lg ${result.correct ? 'bg-green-100' : 'bg-red-100'}`}>
//           <div className="text-6xl mb-4">{result.correct ? '🎉' : '😔'}</div>
//           <div className="text-2xl font-bold mb-2">{result.correct ? 'Well Done!' : 'Keep Trying!'}</div>
//           <div className="text-xl">Accuracy: {result.accuracy}%</div>
//           <div className="text-lg mt-2">Matched {result.matchedLines}/{result.totalLines} lines</div>
//           <div className="text-lg mt-2">Score: {result.score > 0 ? '+' : ''}{result.score}</div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <h3 className="text-xl font-bold mb-3 text-center">Original</h3>
//             <canvas
//               ref={(canvas) => {
//                 if (canvas && currentPattern) {
//                   const ctx = canvas.getContext('2d');
//                   ctx.fillStyle = 'white';
//                   ctx.fillRect(0, 0, canvas.width, canvas.height);
                  
//                   const cellSize = canvas.width / 6;
//                   ctx.fillStyle = '#CBD5E1';
//                   for (let i = 0; i < 6; i++) {
//                     for (let j = 0; j < 6; j++) {
//                       ctx.beginPath();
//                       ctx.arc(cellSize * (i + 0.5), cellSize * (j + 0.5), 4, 0, 2 * Math.PI);
//                       ctx.fill();
//                     }
//                   }
                  
//                   ctx.strokeStyle = '#3B82F6';
//                   ctx.lineWidth = 3;
//                   ctx.lineCap = 'round';
//                   currentPattern.lines.forEach(([x1, y1, x2, y2]) => {
//                     ctx.beginPath();
//                     ctx.moveTo(cellSize * x1, cellSize * y1);
//                     ctx.lineTo(cellSize * x2, cellSize * y2);
//                     ctx.stroke();
//                   });
//                 }
//               }}
//               width={300}
//               height={300}
//               className="border-4 border-blue-300 rounded-lg mx-auto"
//             />
//           </div>
          
//           <div>
//             <h3 className="text-xl font-bold mb-3 text-center">Your Drawing</h3>
//             <canvas
//               ref={(canvas) => {
//                 if (canvas) {
//                   const ctx = canvas.getContext('2d');
//                   ctx.fillStyle = 'white';
//                   ctx.fillRect(0, 0, canvas.width, canvas.height);
                  
//                   const cellSize = canvas.width / 6;
//                   ctx.fillStyle = '#CBD5E1';
//                   for (let i = 0; i < 6; i++) {
//                     for (let j = 0; j < 6; j++) {
//                       ctx.beginPath();
//                       ctx.arc(cellSize * (i + 0.5), cellSize * (j + 0.5), 4, 0, 2 * Math.PI);
//                       ctx.fill();
//                     }
//                   }
                  
//                   ctx.strokeStyle = '#10B981';
//                   ctx.lineWidth = 3;
//                   ctx.lineCap = 'round';
//                   drawnLines.forEach(([x1, y1, x2, y2]) => {
//                     ctx.beginPath();
//                     ctx.moveTo(cellSize * x1, cellSize * y1);
//                     ctx.lineTo(cellSize * x2, cellSize * y2);
//                     ctx.stroke();
//                   });
//                 }
//               }}
//               width={300}
//               height={300}
//               className="border-4 border-green-300 rounded-lg mx-auto"
//             />
//           </div>
//         </div>

//         <div className="flex gap-4">
//           <button
//             onClick={() => {
//               setGameState('setup');
//               setCurrentPattern(null);
//               setDrawnLines([]);
//               setResult(null);
//             }}
//             className="flex-1 bg-purple-500 text-white py-4 rounded-lg font-bold hover:bg-purple-600 flex items-center justify-center gap-2"
//           >
//             <RefreshCw size={24} /> Again
//           </button>
//           <button onClick={() => setCurrentGame('menu')} className="flex-1 bg-gray-500 text-white py-4 rounded-lg font-bold hover:bg-gray-600 flex items-center justify-center gap-2">
//             <Home size={24} /> Menu
//           </button>
//         </div>
//       </div>
//     );
//   }
// };

// export default ThreeGames;