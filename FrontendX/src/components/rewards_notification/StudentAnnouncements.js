import React, { useState, useEffect } from 'react';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'hidden'
  const [stats, setStats] = useState({ totalCount: 0, unreadCount: 0 });
  const [announcementStats, setAnnouncementStats] = useState({ unreadCount: 0 });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchAnnouncements();
    if (activeTab === 'hidden') {
      fetchHiddenAnnouncements();
    }
  }, [activeTab]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      if (!token) {
        setError('Please log in to view announcements');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/student/announcements`, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId 
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      setAnnouncements(data.announcements || []);
      setStats({
        totalCount: data.totalCount || 0,
        unreadCount: data.unreadCount || 0
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements');
      setLoading(false);
    }
  };


// Function to fetch announcement stats
const fetchAnnouncementStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    
    if (!token) return;

    const response = await fetch(`${API_URL}/student/announcements`, {
      headers: { 
        Authorization: `${token}`,
        'X-Device-Id': deviceId 
      }
    });

    if (response.ok) {
      const data = await response.json();
      setAnnouncementStats({
        unreadCount: data.unreadCount || 0,
        totalCount: data.totalCount || 0
      });
    }
  } catch (err) {
    console.error('Error fetching announcement stats:', err);
  }
};

// Add this useEffect to your component
useEffect(() => {
  fetchAnnouncementStats();
  // Optionally refresh every 5 minutes
  const interval = setInterval(fetchAnnouncementStats, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);

  const fetchHiddenAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${API_URL}/student/announcements/hidden`, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId 
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hidden announcements');
      }

      const data = await response.json();
      setHiddenAnnouncements(data.hiddenAnnouncements || []);
    } catch (err) {
      console.error('Error fetching hidden announcements:', err);
    }
  };

  const markAsRead = async (announcementId) => {
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${API_URL}/student/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === announcementId 
              ? { ...ann, isRead: true }
              : ann
          )
        );
        
        setStats(prev => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const hideAnnouncement = async (announcementId) => {
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${API_URL}/student/announcements/${announcementId}/hide`, {
        method: 'POST',
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAnnouncements(prev => prev.filter(ann => ann._id !== announcementId));
        setStats(prev => ({
          totalCount: prev.totalCount - 1,
          unreadCount: announcements.find(a => a._id === announcementId)?.isRead ? prev.unreadCount : prev.unreadCount - 1
        }));
      }
    } catch (err) {
      console.error('Error hiding announcement:', err);
    }
  };

  const unhideAnnouncement = async (announcementId) => {
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${API_URL}/student/announcements/${announcementId}/unhide`, {
        method: 'POST',
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setHiddenAnnouncements(prev => prev.filter(ann => ann._id !== announcementId));
        fetchAnnouncements(); // Refresh active announcements
      }
    } catch (err) {
      console.error('Error unhiding announcement:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#6c5ce7';
      case 'low': return '#6c757d';
      default: return '#6c5ce7';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderLeft: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '40px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '20px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .announcement-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .announcement-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
        }
        .tab-button {
          transition: all 0.3s ease;
        }
        .tab-button.active {
          background: rgba(255, 255, 255, 0.2) !important;
          border-bottom: 3px solid white !important;
        }
      `}} />

      <button 
        onClick={() => window.history.back()}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '1rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        ← Back
      </button>

      <div style={{
        textAlign: 'center',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Announcements & Notifications
        </h1>
        <div style={{
          fontSize: '1.1rem',
          opacity: '0.9'
        }}>
          {stats.unreadCount > 0 && (
            <span style={{
              background: '#ff4757',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '0.9rem',
              marginRight: '10px'
            }}>
              {stats.unreadCount} New
            </span>
          )}
          Total: {stats.totalCount}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '25px',
          padding: '4px',
          display: 'flex',
          backdropFilter: 'blur(10px)'
        }}>
          <button 
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
            style={{
              background: 'transparent',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          >
            Active ({announcements.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'hidden' ? 'active' : ''}`}
            onClick={() => setActiveTab('hidden')}
            style={{
              background: 'transparent',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          >
            Hidden ({hiddenAnnouncements.length})
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {activeTab === 'active' ? (
          announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div 
                key={announcement._id}
                className="announcement-card"
                onClick={() => !announcement.isRead && markAsRead(announcement._id)}
                style={{
                  background: announcement.isRead 
                    ? 'rgba(255, 255, 255, 0.95)' 
                    : 'rgba(255, 255, 255, 1)',
                  borderRadius: '15px',
                  padding: '20px',
                  marginBottom: '15px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  border: announcement.isRead 
                    ? 'none' 
                    : '2px solid #ffd700',
                  position: 'relative'
                }}
              >
                {!announcement.isRead && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: '#ff4757',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    NEW
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    margin: '0',
                    color: '#333',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    paddingRight: '60px'
                  }}>
                    {announcement.title}
                  </h3>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  <span>By: {announcement.createdByName}</span>
                  <span>{formatDate(announcement.createdAt)}</span>
                </div>

                <p style={{
                  margin: '0 0 15px 0',
                  color: '#555',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {announcement.message}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #eee',
                  paddingTop: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    {announcement.targetGroup !== 'all' && (
                      <span style={{
                        background: '#e9ecef',
                        color: '#495057',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.8rem'
                      }}>
                        Group: {announcement.targetGroup}
                      </span>
                    )}
                    
                    {announcement.priority && announcement.priority !== 'normal' && (
                      <span style={{
                        background: getPriorityColor(announcement.priority),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        {announcement.priority}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hideAnnouncement(announcement._id);
                    }}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Hide
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '40px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <h3>No Active Announcements</h3>
              <p>You have no new announcements at this time.</p>
            </div>
          )
        ) : (
          // Hidden announcements tab
          hiddenAnnouncements.length > 0 ? (
            hiddenAnnouncements.map((announcement) => (
              <div 
                key={announcement._id}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '15px',
                  padding: '20px',
                  marginBottom: '15px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  opacity: '0.7'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    margin: '0',
                    color: '#333',
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}>
                    {announcement.title}
                  </h3>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  <span>By: {announcement.createdByName}</span>
                  <span>Hidden: {formatDate(announcement.hiddenAt)}</span>
                </div>

                <p style={{
                  margin: '0 0 15px 0',
                  color: '#555',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {announcement.message}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid #eee',
                  paddingTop: '12px'
                }}>
                  <button
                    onClick={() => unhideAnnouncement(announcement._id)}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Show Again
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '40px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <h3>No Hidden Announcements</h3>
              <p>You haven't hidden any announcements yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;