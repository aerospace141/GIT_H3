import React, { useState, useEffect } from 'react';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templates, setTemplates] = useState({ predefined: [], userCreated: [] });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetGroup: 'all',
    priority: 'normal'
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchTemplates();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${API_URL}/admin/announcements`, {
        headers: {
          'Authorization': token,
          'X-Device-Id': deviceId,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${API_URL}/admin/announcements/templates`, {
        headers: {
          'Authorization': token,
          'X-Device-Id': deviceId,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createAnnouncement = async () => {
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${API_URL}/admin/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'X-Device-Id': deviceId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAnnouncement)
      });
      
      if (response.ok) {
        alert('Announcement created successfully!');
        setShowCreateForm(false);
        setNewAnnouncement({ title: '', message: '', targetGroup: 'all', priority: 'normal' });
        fetchAnnouncements();
      }
    } catch (error) {
      alert('Error creating announcement: ' + error.message);
    }
  };

  const useTemplate = (template) => {
    setNewAnnouncement({
      ...newAnnouncement,
      title: template.title,
      message: template.message
    });
  };

  return (
    <div className="announcement-manager">
      <div className="manager-header">
        <h3>Announcement Manager</h3>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-btn"
        >
          {showCreateForm ? 'Cancel' : 'Create Announcement'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <h4>Create New Announcement</h4>
          
          <div className="templates-section">
            <h5>Quick Templates:</h5>
            <div className="template-buttons">
              {templates.predefined.map((template, index) => (
                <button 
                  key={index}
                  // onClick={() => useTemplate(template)}
                  className="template-btn"
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
              placeholder="Enter announcement title..."
            />
          </div>

          <div className="form-group">
            <label>Message:</label>
            <textarea
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
              placeholder="Enter your message..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Group:</label>
              <select
                value={newAnnouncement.targetGroup}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, targetGroup: e.target.value})}
              >
                <option value="all">All Students</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority:</label>
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={createAnnouncement} className="submit-btn">
              Create Announcement
            </button>
            <button onClick={() => setShowCreateForm(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="announcements-list">
        <h4>Recent Announcements</h4>
        {announcements.length === 0 ? (
          <div className="empty-state">No announcements yet</div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement._id} className="announcement-card">
              <div className="announcement-header">
                <h5>{announcement.title}</h5>
                <div className="announcement-meta">
                  <span className={`priority-badge priority-${announcement.priority}`}>
                    {announcement.priority}
                  </span>
                  <span className="date">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="announcement-content">
                <p>{announcement.message}</p>
              </div>
              <div className="announcement-stats">
                <span>Target: {announcement.targetGroup}</span>
                <span>Read: {announcement.readCount || 0}/{announcement.targetStudentCount || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .announcement-manager {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin: 20px 0;
        }
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .create-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .create-form {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .templates-section {
          margin-bottom: 20px;
        }
        .template-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .template-btn {
          background: #e9ecef;
          border: 1px solid #ced4da;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .template-btn:hover {
          background: #dee2e6;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .submit-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .announcements-list {
          margin-top: 20px;
        }
        .empty-state {
          text-align: center;
          color: #6c757d;
          padding: 40px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .announcement-card {
          background: #fff;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .announcement-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .priority-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .priority-low { background: #d1ecf1; color: #0c5460; }
        .priority-normal { background: #d4edda; color: #155724; }
        .priority-high { background: #fff3cd; color: #856404; }
        .priority-urgent { background: #f8d7da; color: #721c24; }
        .announcement-content p {
          margin: 0;
          color: #495057;
        }
        .announcement-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementManager;