import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const StudentPerformanceChart = ({ student, performanceData }) => {
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'games', 'accuracy', 'progress'

  const formatGameHistory = () => {
    if (!performanceData?.history) return [];
    
    return performanceData.history.slice(-10).map((game, index) => ({
      game: index + 1,
      accuracy: game.accuracy || 0,
      score: game.score || 0,
      correct: game.correctAnswers || 0,
      total: game.totalQuestions || 0,
      gameType: game.gameType,
      date: new Date(game.timestamp).toLocaleDateString()
    }));
  };

  const calculateGameTypeStats = () => {
    if (!performanceData?.gameTypes) return [];
    
    return Array.from(performanceData.gameTypes.entries()).map(([type, stats]) => ({
      type,
      accuracy: stats.accuracy || 0,
      totalPlayed: stats.plays || 0,
      totalCorrect: stats.correct || 0,
      totalQuestions: stats.total || 0,
      bestScore: stats.bestScore || 0
    }));
  };

  const OverviewPanel = () => (
    <div className="overview-panel">
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Games</h4>
          <div className="stat-value">{performanceData?.totalGames || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Overall Accuracy</h4>
          <div className="stat-value">
            {performanceData?.totalQuestions > 0 
              ? Math.round((performanceData.totalCorrect / performanceData.totalQuestions) * 100)
              : 0}%
          </div>
        </div>
        <div className="stat-card">
          <h4>Total Score</h4>
          <div className="stat-value">{performanceData?.totalScore || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Perfect Games</h4>
          <div className="stat-value">{performanceData?.achievements?.perfectGames || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Current Streak</h4>
          <div className="stat-value">{performanceData?.achievements?.streaks?.current || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Best Streak</h4>
          <div className="stat-value">{performanceData?.achievements?.streaks?.longest || 0}</div>
        </div>
      </div>
      
      {student.rewards && (
        <div className="rewards-section">
          <h4>Current Rewards</h4>
          <div className="rewards-display">
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span className="reward-count">{student.rewards.stars || 0}</span>
              <span className="reward-label">Stars</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">🏆</span>
              <span className="reward-count">{student.rewards.badges || 0}</span>
              <span className="reward-label">Badges</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const GameHistoryPanel = () => (
    <div className="game-history-panel">
      <h4>Recent Game History</h4>
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Game Type</th>
              <th>Correct/Total</th>
              <th>Accuracy</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {formatGameHistory().map((game, index) => (
              <tr key={index}>
                <td>{game.date}</td>
                <td>{game.gameType}</td>
                <td>{game.correct}/{game.total}</td>
                <td>{game.accuracy.toFixed(1)}%</td>
                <td>{game.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const GameTypeStatsPanel = () => (
    <div className="game-type-stats">
      <h4>Performance by Game Type</h4>
      <div className="game-type-grid">
        {calculateGameTypeStats().map((gameType, index) => (
          <div key={index} className="game-type-card">
            <h5>{gameType.type}</h5>
            <div className="game-type-details">
              <div className="detail-row">
                <span>Games Played:</span>
                <span>{gameType.totalPlayed}</span>
              </div>
              <div className="detail-row">
                <span>Accuracy:</span>
                <span>{gameType.accuracy.toFixed(1)}%</span>
              </div>
              <div className="detail-row">
                <span>Questions:</span>
                <span>{gameType.totalCorrect}/{gameType.totalQuestions}</span>
              </div>
              <div className="detail-row">
                <span>Best Score:</span>
                <span>{gameType.bestScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="performance-chart-container">
      <div className="chart-header">
        <h3>{student.firstName} {student.lastName} - Performance Details</h3>
        <div className="view-tabs">
          {['overview', 'games', 'accuracy'].map(mode => (
            <button 
              key={mode}
              className={`tab-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-content">
        {viewMode === 'overview' && <OverviewPanel />}
        {viewMode === 'games' && <GameHistoryPanel />}
        {viewMode === 'accuracy' && <GameTypeStatsPanel />}
      </div>

      <style jsx>{`
        .performance-chart-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin: 20px 0;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }
        .view-tabs {
          display: flex;
          gap: 10px;
        }
        .tab-btn {
          background: #f8f9fa;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .tab-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        .stat-card h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #6c757d;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .rewards-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .rewards-display {
          display: flex;
          gap: 20px;
          margin-top: 10px;
        }
        .reward-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
          padding: 10px 15px;
          border-radius: 8px;
        }
        .reward-icon {
          font-size: 20px;
        }
        .reward-count {
          font-size: 18px;
          font-weight: bold;
        }
        .reward-label {
          font-size: 14px;
          color: #6c757d;
        }
        .history-table {
          overflow-x: auto;
        }
        .history-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .history-table th,
        .history-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .history-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
        .game-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .game-type-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
        }
        .game-type-card h5 {
          margin: 0 0 15px 0;
          color: #333;
          text-transform: capitalize;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .detail-row span:first-child {
          color: #6c757d;
        }
        .detail-row span:last-child {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
export default StudentPerformanceChart;
