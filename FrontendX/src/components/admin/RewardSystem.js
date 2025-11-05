import React, { useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


const RewardSystem = ({ students, onRewardGiven }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rewardType, setRewardType] = useState('stars');
  const [amount, setAmount] = useState(1);
  const [note, setNote] = useState('');
  const [isGiving, setIsGiving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const giveReward = async () => {
    setIsGiving(true);
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');

      if (bulkMode) {
        const response = await fetch(`${API_URL}/admin/rewards/bulk`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'X-Device-Id': deviceId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentIds: selectedStudents,
            type: rewardType,
            amount,
            note
          })
        });

        if (response.ok) {
          const result = await response.json();
          alert(`Rewards given to ${result.results.filter(r => r.success).length} students`);
          onRewardGiven?.();
          setSelectedStudents([]);
          setNote('');
        }
      } else {
        const response = await fetch(`${API_URL}/admin/students/${selectedStudent._id}/rewards`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'X-Device-Id': deviceId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: rewardType,
            amount,
            note
          })
        });

        if (response.ok) {
          const result = await response.json();
          alert(`${amount} ${rewardType} given to ${selectedStudent.firstName} ${selectedStudent.lastName}`);
          onRewardGiven?.();
          setSelectedStudent(null);
          setNote('');
        }
      }
    } catch (error) {
      alert('Error giving reward: ' + error.message);
    }
    setIsGiving(false);
  };

  return (
    <div className="reward-system-container">
      <div className="reward-header">
        <h3>Reward Students;</h3>
        <div className="mode-toggle">
          <button 
            onClick={() => setBulkMode(!bulkMode)}
            className={`toggle-btn ${bulkMode ? 'active' : ''}`}
          >
            {bulkMode ? 'Bulk Mode' : 'Single Mode'}
          </button>
        </div>
      </div>

      <div className="reward-form">
        {!bulkMode ? (
          <div className="student-selector">
            <label>Select Student:</label>
            <select 
              value={selectedStudent?._id || ''} 
              onChange={(e) => {
                const student = students.find(s => s._id === e.target.value);
                setSelectedStudent(student);
              }}
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} - {student.group || 'No Group'}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bulk-selector">
            <label>Select Students ({selectedStudents.length} selected):</label>
            <div className="student-checkboxes">
              {students.map(student => (
                <label key={student._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student._id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                      }
                    }}
                  />
                  {student.firstName} {student.lastName}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="reward-controls">
          <div className="control-group">
            <label>Reward Type:</label>
            <select value={rewardType} onChange={(e) => setRewardType(e.target.value)}>
              <option value="stars">Stars ⭐</option>
              <option value="badges">Badges 🏆</option>
            </select>
          </div>

          <div className="control-group">
            <label>Amount:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>Note (optional):</label>
            <input
              type="text"
              placeholder="Reason for reward..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button 
            onClick={giveReward}
            disabled={isGiving || (!bulkMode && !selectedStudent) || (bulkMode && selectedStudents.length === 0)}
            className="give-reward-btn"
          >
            {isGiving ? 'Giving Reward...' : `Give ${amount} ${rewardType}`}
          </button>
        </div>

        {/* Quick Reward Presets */}
        <div className="reward-presets">
          <h4>Quick Rewards:</h4>
          <div className="preset-buttons">
            <button onClick={() => { setRewardType('stars'); setAmount(1); setNote('Great work!'); }}>
              ⭐ 1 Star - Great Work
            </button>
            <button onClick={() => { setRewardType('stars'); setAmount(3); setNote('Excellent performance!'); }}>
              ⭐ 3 Stars - Excellent
            </button>
            <button onClick={() => { setRewardType('badges'); setAmount(1); setNote('Outstanding achievement!'); }}>
              🏆 1 Badge - Outstanding
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reward-system-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin: 20px 0;
        }
        .reward-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .mode-toggle .toggle-btn {
          background: #f0f0f0;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .mode-toggle .toggle-btn.active {
          background: #3b82f6;
          color: white;
        }
        .student-selector, .bulk-selector {
          margin-bottom: 15px;
        }
        .student-selector select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        .student-checkboxes {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px;
        }
        .checkbox-label {
          display: block;
          margin: 5px 0;
          cursor: pointer;
        }
        .reward-controls {
          display: grid;
          grid-template-columns: 1fr 1fr 2fr 1fr;
          gap: 15px;
          align-items: end;
          margin: 20px 0;
        }
        .control-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .control-group input, .control-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .give-reward-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .give-reward-btn:disabled {
          background: #gray-400;
          cursor: not-allowed;
        }
        .reward-presets {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .preset-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .preset-buttons button {
          background: #f8f9fa;
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .preset-buttons button:hover {
          background: #e9ecef;
        }
      `}</style>
    </div>
  );
};
export default RewardSystem;