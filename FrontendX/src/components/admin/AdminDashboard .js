import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Award, 
  MessageSquare, 
  BarChart3, 
  Download,
  Clock,
  Play,
  Pause,
  Eye,
  Star,
  Trophy,
  Target,
  Calendar,
  Filter,
  Settings,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Gift,
  UserPlus,
  Cog

} from 'lucide-react';
import '../../styles/admin/AdminDashboard.css';
import StudentRegistration from './StudentRegistration'; // Add this line to your imports
import AdminStudentGroupManagement from './AdminStudentGroupManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Use your existing API URL from the student app
  const API_URL = process.env.REACT_APP_API_BASE_URL;

  const [showStudentRegistration, setShowStudentRegistration] = useState(false);

  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showModal, setShowModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data from your existing backend
  const [students, setStudents] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [liveTest, setLiveTest] = useState(null);

  // Authentication check using your existing auth system
  useEffect(() => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');

    if (!token) {
      navigate('/login');
      return;
    }

    // Verify admin/teacher role using your existing auth endpoint
    axios.get(`${API_URL}/auth/verify`, {
      headers: { 
        Authorization: `${token}`,
        'X-Device-Id': deviceId 
      }
    })
    .then(response => {
      // Check if user has admin/teacher privileges
      // You may need to add a role field to your User model
      if (response.data.role !== 'teacher') {
        alert('Access denied. Teacher privileges required.');
        navigate('/');
        return;
      }
      loadDashboardData();
    })
    .catch(err => {
      console.error("Authentication error:", err);
      localStorage.removeItem('token');
      navigate('/signin');
    });
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStudents(),
        loadAnnouncements(),
        loadPerformanceStats()
      ] );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load all students using your existing backend
  const loadStudents = async () => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    
    try {
      // Since your backend doesn't have a specific admin endpoint yet,
      // we'll extend your existing auth verification to return user lists for teachers
      const response = await axios.get(`${API_URL}/admin/students`, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId 
        }
      });
      
      setStudents(response.data || []);
    console.log('Students loaded:', response.data);
    console.log('Performance data loaded:', response.data.performance);
    } catch (error) {
      console.error('Error loading students:', error);
      // Fallback: create mock data structure matching your existing user model
      setStudents([]);
    }
  };

  // Load performance data for all students using your existing performance endpoint
  // const loadPerformanceStats = async () => {
  //   const token = localStorage.getItem('token');
  //   const deviceId = localStorage.getItem('deviceId');

  //   console.log('Loading performance stats for students:', 
  //     students.userId);
    
    
  //   const stats = {};
    
  //   for (const student of students) {
  //     try {
  //       const response = await axios.get(`${API_URL}/admin/performance/${student.userId}`, {
  //         headers: { 
  //           Authorization: `${token}`,
  //           'X-Device-Id': deviceId 
  //         }
  //       });
        
  //       console.log(`Performance data for ${student.userId}:`, response.data);
        
  //       if (response.data) {
  //         stats[student.userId] = response.data;
  //       }
  //     } catch (error) {
  //       console.error(`Error loading performance for ${student.userId}:`, error);
  //     }
  //   }
    
  //   setPerformanceData(stats);
  // };
  const loadPerformanceStats = async () => {
  const token = localStorage.getItem('token');
  const deviceId = localStorage.getItem('deviceId');

  const stats = {};

  for (const student of students) {
    try {
      const response = await axios.get(`${API_URL}/admin/performance/${student.userId}`, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId 
        }
      });

      console.log(`Performance data for   ${student.userId}:`, response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        stats[student.userId] = response.data[0];  // ✅ use first entry
      } else {
        stats[student.userId] = {}; // ✅ empty if no data
      }
    } catch (error) {
      console.error(`Error loading performance for ${student.userId}:`, error);
    }
  }

  setPerformanceData(stats);
};

// 🔑 Run when component mounts
useEffect(() => {
  if (students && students.length > 0) {
    loadPerformanceStats();
  }
}, [students]); // runs again whenever students list changes


  // Create new student using your existing backend structure
  const createStudent = async (studentData) => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    
    try {
      // This would require extending your backend to handle student creation by admins
      const response = await axios.post(`${API_URL}/admin/students`, {
        ...studentData,
        role: 'student'
      }, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        await loadStudents(); // Refresh the list
        setShowModal(null);
      }
    } catch (error) {
      console.error('Error creating student:', error);
      setError('Failed to create student');
    }
  };

  // Launch test - this would integrate with your existing game system
  const launchTest = async (testConfig) => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    
    try {
      // This would require new endpoints in your backend
      const response = await axios.post(`${API_URL}/admin/tests/launch`, testConfig, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setLiveTest(response.data.test);
        setShowModal(null);
      }
    } catch (error) {
      console.error('Error launching test:', error);
      setError('Failed to launch test');
    }
  };

  // Give rewards to student - extends your existing performance tracking
  const giveRewards = async (studentId, rewardType, amount, note) => {
 
    
    try {
        const token = localStorage.getItem('token');
        const deviceId = localStorage.getItem('deviceId');

        const response = await fetch(`${API_URL}/admin/students/${studentId}/rewards`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'X-Device-Id': deviceId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: rewardType, amount, note })
        });

        if (response.ok) {
          alert(`${amount} ${rewardType} given successfully!`);
          loadStudents(); // Refresh student data
          // setNote('');
          setSelectedStudent(null);
        } else {
          alert('Error giving reward');
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
  };

  // Create announcement
  const createAnnouncement = async (announcementData) => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    
    try {
      const response = await axios.post(`${API_URL}/admin/announcements`, announcementData, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        await loadAnnouncements();
        setShowModal(null);
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      setError('Failed to create announcement');
    }
  };

  const loadAnnouncements = async () => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    
    try {
      const response = await axios.get(`${API_URL}/admin/announcements`, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId 
        }
      });
      
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    }
  };

  // Export performance data using your existing data structure
  const exportPerformanceData = () => {
    const csvData = students.map(student => {
      const perf = performanceData[student.userId];
      return {
        Name: student.name || student.email,
        Email: student.email,
        TotalGames: perf?.totalGames || 0,
        TotalCorrect: perf?.totalCorrect || 0,
        TotalScore: perf?.totalScore || 0,
        Accuracy: perf ? ((perf.totalCorrect / perf.totalGames) * 100).toFixed(2) : '0.00'
      };
    });

    // Convert to CSV
    const csvHeaders = Object.keys(csvData[0]).join(',');
    const csvRows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_performance.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter students based on search and group
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || student.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Overview statistics calculated from your existing data
  const calculateStats = () => {
    const totalStudents = students.length;
    const totalGames = Object.values(performanceData).reduce((sum, p) => sum + (p.totalGames || 0), 0);
    const avgAccuracy = Object.values(performanceData).length > 0 
      ? Object.values(performanceData).reduce((sum, p) => sum + ((p.totalCorrect || 0) / (p.totalGames || 1) * 100), 0) / Object.values(performanceData).length
      : 0;

    return {
      totalStudents,
      totalGames,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  // Test Launch Modal using your existing game types
  const TestLaunchModal = () => {
    const [testConfig, setTestConfig] = useState({
      duration: 10,
      gameType: 'multiplication', // Use your existing game types
      difficulty: 'double',
      speed: 2,
      count: 10,
      targetStudents: 'all'
    });

    const handleLaunchTest = () => {
      launchTest(testConfig);
    };

    return (
      <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(null)}>
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h3 className="admin-modal-title">Launch New Test</h3>
            <button className="admin-modal-close" onClick={() => setShowModal(null)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Game Type</label>
              <select 
                value={testConfig.gameType} 
                onChange={(e) => setTestConfig({...testConfig, gameType: e.target.value})}
                className="admin-form-select"
              >
                <option value="multiplication">Multiplication</option>
                <option value="addition">Addition</option>
                <option value="subtraction">Subtraction</option>
                <option value="division">Division</option>
                {/* <option value="mixedMath">Mixed Math</option> */}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Difficulty</label>
              <select 
                value={testConfig.difficulty}
                onChange={(e) => setTestConfig({...testConfig, difficulty: e.target.value})}
                className="admin-form-select"
              >
                <option value="single">Single Digit</option>
                <option value="double">Double Digit</option>
                <option value="triple">Triple Digit</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Speed (seconds)</label>
              <input 
                type="number"
                value={testConfig.speed}
                onChange={(e) => setTestConfig({...testConfig, speed: parseInt(e.target.value)})}
                min="1"
                max="10"
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Number of Questions</label>
              <input 
                type="number"
                value={testConfig.count}
                onChange={(e) => setTestConfig({...testConfig, count: parseInt(e.target.value)})}
                min="5"
                max="50"
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Duration (minutes)</label>
              <input 
                type="number"
                value={testConfig.duration}
                onChange={(e) => setTestConfig({...testConfig, duration: parseInt(e.target.value)})}
                min="5"
                max="60"
                className="admin-form-input"
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button 
              onClick={handleLaunchTest}
              className="admin-btn admin-btn-primary admin-btn-full"
            >
              <Play size={16} />
              Launch Test
            </button>
            <button 
              onClick={() => setShowModal(null)}
              className="admin-btn admin-btn-secondary admin-btn-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Overview Tab Content using your existing data structure
  const OverviewContent = () => (
    <div>
      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>Total Students</h3>
              <p className="admin-stat-number">{stats.totalStudents}</p>
            </div>
            <div className="admin-stat-icon">
              <Users size={24} />
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>Avg Accuracy</h3>
              <p className="admin-stat-number">{stats.avgAccuracy}%</p>
            </div>
            <div className="admin-stat-icon success">
              <Target size={24} />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>Total Games</h3>
              <p className="admin-stat-number">{stats.totalGames}</p>
            </div>
            <div className="admin-stat-icon info">
              <BarChart3 size={24} />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>Announcements</h3>
              <p className="admin-stat-number">{announcements.length}</p>
            </div>
            <div className="admin-stat-icon warning">
              <Bell size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity using your existing performance data */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">Recent Student Activity</h3>
        </div>
        <div className="admin-section-content">
          {students.slice(0, 5).map(student => {
            const perf = performanceData[student.userId];
            const accuracy = perf ? ((perf.totalCorrect / perf.totalGames) * 100).toFixed(1) : 0;
            
            return (
              <div key={student.userId} className="admin-flex admin-items-center admin-justify-between admin-mb-md" 
                   style={{padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)'}}>
                <div>
                  <p style={{fontWeight: 600, marginBottom: 'var(--spacing-xs)'}}>{student.name || student.email}</p>
                  <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                    Last active: Recent
                  </p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontWeight: 600}}>{accuracy}% accuracy</p>
                  <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                    {perf?.totalGames || 0} games played
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Students Tab Content integrated with your backend
  const StudentsContent = () => (
    <div>
      {/* Search and Filter Bar */}
      <div className="admin-section admin-mb-xl">
        <div className="admin-section-content">
          <div className="admin-flex admin-items-center admin-gap-md">
            <div className="admin-search-container">
              <Search className="admin-search-icon" size={16} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <button
              onClick={exportPerformanceData}
              className="admin-btn admin-btn-outline"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Students Table with your existing data */}
      <div className="admin-section">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Performance</th>
                <th>Total Games</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const perf = performanceData[student.userId] || {};
                const accuracy = perf.totalGames ? ((perf.totalCorrect / perf.totalGames) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={student.userId}>
                    <td>
                      <div>
                        <div style={{fontWeight: 600, marginBottom: 'var(--spacing-xs)'}}>
                          {student.firstName  || 'No Name'} {student.lastName  || 'No Name'}
                        </div>
                        <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{fontWeight: 600, marginBottom: 'var(--spacing-xs)'}}>
                          {accuracy}% accuracy
                        </div>
                        <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                          {perf.totalCorrect || 0}/{perf.totalGames || 0} correct
                        </div>
                      </div>
                    </td>
                    <td style={{fontWeight: 600}}>
                      {perf.totalGames || 0}
                    </td>
                    <td>
                      <div className="admin-flex admin-items-center admin-gap-sm">
                        <button
                          onClick={() => setSelectedStudent({...student, performance: perf})}
                          style={{background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 'var(--spacing-sm)'}}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => giveRewards(student._id, 'stars', 1, 'Good work!')}
                          style={{background: 'none', border: 'none', color: 'var(--warning-color)', cursor: 'pointer', padding: 'var(--spacing-sm)'}}
                        >
                          <Star size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Tests Page Content
  // const TestsContent = () => (
  //   <div>
  //     <div className="adminDash-test-quick-stats">
  //       <div className="adminDash-quick-stat-item">
  //         <div className="adminDash-quick-stat-number">12</div>
  //         <div className="adminDash-quick-stat-label">Active Tests</div>
  //       </div>
  //       <div className="adminDash-quick-stat-item">
  //         <div className="adminDash-quick-stat-number">45</div>
  //         <div className="adminDash-quick-stat-label">Completed</div>
  //       </div>
  //       <div className="adminDash-quick-stat-item">
  //         <div className="adminDash-quick-stat-number">89%</div>
  //         <div className="adminDash-quick-stat-label">Success Rate</div>
  //       </div>
  //     </div>
      
  //     <div className="adminDash-tests-management-section">
  //       <div className="adminDash-test-history-card">
  //         <h3>Recent Tests</h3>
  //         <p>View and manage recently launched tests</p>
  //       </div>
  //       <div className="adminDash-test-settings-card">
  //         <h3>Test Templates</h3>
  //         <p>Create and save test configurations</p>
  //       </div>
  //     </div>
  //   </div>
  // );
  // Add this to your AdminDashboard.js - Replace the TestsContent function

// Enhanced Tests Page Content with Recent Test Results
const TestsContent = () => {
  const [testResults, setTestResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);

  // Load recent test results
  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    setLoadingResults(true);
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${API_URL}/admin/tests/test-results`, {
        headers: {
          'Authorization': token,
          'X-Device-Id': deviceId,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(data);
      }
    } catch (error) {
      console.error('Error loading test results:', error);
    } finally {
      setLoadingResults(false);
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

  const formatTimeSpent = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateAverageTime = (results) => {
    if (!results || results.length === 0) return 0;
    const validTimes = results.filter(r => r.timeSpent > 0);
    if (validTimes.length === 0) return 0;
    return Math.round(validTimes.reduce((sum, r) => sum + r.timeSpent, 0) / validTimes.length);
  };

  return (
    <div>
      {/* Quick Stats */}
      <div className="admin-stats-grid admin-mb-xl">
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>Total Tests</h3>
              <p className="admin-stat-number">{testResults.length}</p>
            </div>
            <div className="admin-stat-icon">
              <Target size={24} />
            </div>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>Avg Score</h3>
              <p className="admin-stat-number">
                {testResults.length > 0 
                  ? Math.round(testResults.reduce((sum, test) => sum + (test.averageScore || 0), 0) / testResults.length)
                  : 0}%
              </p>
            </div>
            <div className="admin-stat-icon success">
              <Award size={24} />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>Completion Rate</h3>
              <p className="admin-stat-number">
                {testResults.length > 0 
                  ? Math.round((testResults.filter(test => test.status === 'completed').length / testResults.length) * 100)
                  : 0}%
              </p>
            </div>
            <div className="admin-stat-icon info">
              <BarChart3 size={24} />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>Avg Time</h3>
              <p className="admin-stat-number">
                {testResults.length > 0 
                  ? formatTimeSpent(
                      Math.round(
                        testResults.reduce((sum, test) => sum + calculateAverageTime(test.results), 0) / testResults.length
                      )
                    )
                  : '0:00'}
              </p>
            </div>
            <div className="admin-stat-icon warning">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Test Results Table */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">Recent Test Results</h3>
          <button 
            onClick={loadTestResults}
            className="admin-btn admin-btn-outline"
            disabled={loadingResults}
          >
            {loadingResults ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="admin-section-content">
          {loadingResults ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f4f6', 
                borderTop: '4px solid #3b82f6', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              Loading test results...
            </div>
          ) : testResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <Target size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h4>No Test Results Yet</h4>
              <p>Test results will appear here once students complete tests</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Test Details</th>
                    <th>Participants</th>
                    <th>Average Score</th>
                    <th>Average Time</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((test, index) => (
                    <tr key={test._id || index}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                            {test.testType} - {test.difficultyLevel}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {test.count} questions • {test.duration} min
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {test.results?.length || 0} students
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }} className={getScoreColor(test.averageScore || 0)}>
                          {test.averageScore || 0}%
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#6b7280' }}>
                          {formatTimeSpent(calculateAverageTime(test.results))}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: test.status === 'completed' ? '#dcfdf7' : 
                                         test.status === 'active' ? '#fef3c7' : '#fee2e2',
                          color: test.status === 'completed' ? '#047857' : 
                                 test.status === 'active' ? '#92400e' : '#b91c1c'
                        }}>
                          {test.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem' }}>
                          {formatDate(test.createdAt || test.startTime)}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedTest(test)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedTest(null)}>
          <div className="admin-modal" style={{ maxWidth: '900px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Test Results: {selectedTest.testType} ({selectedTest.difficultyLevel})
              </h3>
              <button className="admin-modal-close" onClick={() => setSelectedTest(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="admin-modal-body">
              {/* Test Overview */}
              <div className="admin-stats-grid admin-mb-lg">
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <div className="admin-stat-info">
                      <h4>Participants</h4>
                      <p className="admin-stat-number">{selectedTest.results?.length || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <div className="admin-stat-info">
                      <h4>Average Score</h4>
                      <p className="admin-stat-number">{selectedTest.averageScore || 0}%</p>
                    </div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <div className="admin-stat-info">
                      <h4>Highest Score</h4>
                      <p className="admin-stat-number">
                        {selectedTest.results && selectedTest.results.length > 0 
                          ? Math.max(...selectedTest.results.map(r => r.score)) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <div className="admin-stat-info">
                      <h4>Average Time</h4>
                      <p className="admin-stat-number">
                        {formatTimeSpent(calculateAverageTime(selectedTest.results))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Results */}
              {selectedTest.results && selectedTest.results.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Individual Results</h4>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Score</th>
                          <th>Correct/Total</th>
                          <th>Time Taken</th>
                          <th>Violations</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTest.results.map((result, index) => (
                          <tr key={index}>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {result.studentName || result.studentId}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }} className={getScoreColor(result.score)}>
                                {result.score}%
                              </div>
                            </td>
                            <td>
                              {result.correctCount}/{result.totalQuestions}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {formatTimeSpent(result.timeSpent)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                of {selectedTest.duration} min
                              </div>
                            </td>
                            <td>
                              <span style={{
                                color: result.violations?.length > 0 ? '#dc2626' : '#059669'
                              }}>
                                {result.violations?.length || 0}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                backgroundColor: result.isAutoSubmit ? '#fee2e2' : '#dcfdf7',
                                color: result.isAutoSubmit ? '#b91c1c' : '#047857'
                              }}>
                                {result.isAutoSubmit ? 'Auto-submitted' : 'Completed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button 
                onClick={() => {
                  // Export this specific test's results
                  const csvData = selectedTest.results?.map(result => ({
                    Student: result.studentName || result.studentId,
                    Score: result.score,
                    'Correct Answers': result.correctCount,
                    'Total Questions': result.totalQuestions,
                    'Time Taken (MM:SS)': formatTimeSpent(result.timeSpent),
                    'Time Taken (Seconds)': result.timeSpent || 0,
                    Violations: result.violations?.length || 0,
                    Status: result.isAutoSubmit ? 'Auto-submitted' : 'Completed'
                  })) || [];
                  
                  if (csvData.length > 0) {
                    const csvHeaders = Object.keys(csvData[0]).join(',');
                    const csvRows = csvData.map(row => Object.values(row).join(','));
                    const csvContent = [csvHeaders, ...csvRows].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `test_results_${selectedTest._id}_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }
                }}
                className="admin-btn admin-btn-outline"
              >
                <Download size={16} />
                Export Results
              </button>
              <button 
                onClick={() => setSelectedTest(null)}
                className="admin-btn admin-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetGroup: 'all'
  });

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

  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert('Please fill in title and message');
      return;
    }

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
        setNewAnnouncement({ title: '', message: '', targetGroup: 'all' });
        fetchAnnouncements();
      }
    } catch (error) {
      alert('Error creating announcement: ' + error.message);
    }
  };

  // FIXED: Renamed from useTemplate to applyTemplate
  const applyTemplate = (template) => {
    setNewAnnouncement({
      ...newAnnouncement,
      title: template.title,
      message: template.message
    });
  };

  const templates = [
    { title: 'Test Reminder', message: 'Dear students, this is a reminder about your upcoming test. Please prepare well!' },
    { title: 'Great Work!', message: 'Congratulations to all students who performed well in recent activities!' },
    { title: 'Class Update', message: 'Important update about our class schedule and activities.' }
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h3>Create Announcement</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Quick Templates:</label>
        <div style={{ display: 'flex', gap: '10px', margin: '5px 0', flexWrap: 'wrap' }}>
          {templates.map((template, index) => (
            <button 
              key={index}
              onClick={() => applyTemplate(template)} 
              style={{ 
                background: '#e9ecef', 
                border: '1px solid #ced4da', 
                padding: '6px 12px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {template.title}
            </button>
          ))}
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <div style={{ marginBottom: '15px' }}>
        <label>Title:</label>
        <input
          type="text"
          value={newAnnouncement.title}
          onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
          placeholder="Enter announcement title..."
          style={{ width: '100%', padding: '8px', margin: '5px 0' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Message:</label>
        <textarea
          value={newAnnouncement.message}
          onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
          placeholder="Enter your message..."
          rows="4"
          style={{ width: '100%', padding: '8px', margin: '5px 0', resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Target:</label>
        <select
          value={newAnnouncement.targetGroup}
          onChange={(e) => setNewAnnouncement({...newAnnouncement, targetGroup: e.target.value})}
          style={{ padding: '8px', margin: '5px 0' }}
        >
          <option value="all">All Students</option>
          <option value="group1">Group 1</option>
          <option value="group2">Group 2</option>
        </select>
      </div>

      <button 
        onClick={createAnnouncement}
        style={{ 
          background: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Create Announcement
      </button>

      <div style={{ marginTop: '30px' }}>
        <h4>Recent Announcements</h4>
        {announcements.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No announcements yet</p>
        ) : (
          announcements.slice(0, 5).map((announcement, index) => (
            <div key={index} style={{ 
              border: '1px solid #e9ecef', 
              borderRadius: '6px', 
              padding: '15px', 
              margin: '10px 0',
              background: '#f8f9fa'
            }}>
              <h5 style={{ margin: '0 0 8px 0' }}>{announcement.title}</h5>
              <p style={{ margin: '0 0 8px 0', color: '#495057' }}>{announcement.message}</p>
              <small style={{ color: '#6c757d' }}>
                Target: {announcement.targetGroup} | 
                Created: {new Date(announcement.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


    const RewardSection = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [rewardType, setRewardType] = useState('stars');
    const [amount, setAmount] = useState(1);
    const [note, setNote] = useState('');
    const [isGiving, setIsGiving] = useState(false);

    const giveReward = async () => {
      if (!selectedStudent) return;
      
      setIsGiving(true);
      try {
        const token = localStorage.getItem('token');
        const deviceId = localStorage.getItem('deviceId');

        const response = await fetch(`${API_URL}/admin/students/${selectedStudent._id}/rewards`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'X-Device-Id': deviceId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: rewardType, amount, note })
        });

        if (response.ok) {
          alert(`${amount} ${rewardType} given successfully!`);
          loadStudents(); // Refresh student data
          setNote('');
          setSelectedStudent(null);
        } else {
          alert('Error giving reward');
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
      setIsGiving(false);
    };

    return (
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3>Give Rewards to Students</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Select Student:</label>
          <select 
            value={selectedStudent?._id || ''} 
            onChange={(e) => {
              const student = students.find(s => s._id === e.target.value);
              setSelectedStudent(student);
            }}
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          >
            <option value="">Choose a student...</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label>Type:</label>
            <select 
              value={rewardType} 
              onChange={(e) => setRewardType(e.target.value)}
              style={{ padding: '8px' }}
            >
              <option value="stars">Stars ⭐</option>
              <option value="badges">Badges 🏆</option>
            </select>
          </div>
          
          <div>
            <label>Amount:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              style={{ padding: '8px', width: '80px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Note:</label>
          <input
            type="text"
            placeholder="Reason for reward..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
        </div>

        <button 
          onClick={giveReward}
          disabled={!selectedStudent || isGiving}
          style={{ 
            background: '#10b981', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '6px',
            cursor: selectedStudent && !isGiving ? 'pointer' : 'not-allowed',
            opacity: selectedStudent && !isGiving ? 1 : 0.6
          }}
        >
          {isGiving ? 'Giving...' : `Give ${amount} ${rewardType}`}
        </button>

        {selectedStudent && selectedStudent.rewards && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
            <strong>{selectedStudent.firstName}'s Current Rewards:</strong><br/>
            ⭐ Stars: {selectedStudent.rewards.stars || 0} | 
            🏆 Badges: {selectedStudent.rewards.badges || 0}
          </div>
        )}
      </div>
    );
  };


  const handleStudentCreated = (newStudent) => {
  // Refresh the student list after creating a new student
  loadStudents();
  setShowStudentRegistration(false);
};

      {showStudentRegistration && (
      <StudentRegistration
        onClose={() => setShowStudentRegistration(false)}
        onStudentCreated={handleStudentCreated}
      />
    )}

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark-theme' : ''}`}>
      <div className="admin-layout">
        {/* Sidebar */}
        <div className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="admin-sidebar-header">
            <h1 className="admin-sidebar-title">Teacher Dashboard</h1>
          </div>
          
          <nav className="admin-nav">
            <ul className="admin-nav-list">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'tests', label: 'Tests', icon: Target },
                { id: 'announcements', label: 'Announcements', icon: Bell },
                { id: 'rewards', label: 'Rewards', icon: Gift },
                { id: 'StudentRegistration', label: 'Add Student', icon: UserPlus },
                { id: 'Admin_Student_Group_Management', label: 'Manage Groups', icon: Cog  },

              ].map(tab => (
                <li key={tab.id} className="admin-nav-item">
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`admin-nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <tab.icon className="admin-nav-icon" size={20} />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="admin-sidebar-footer">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="admin-theme-toggle"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main">
          {/* Top Bar */}
          <div className="admin-topbar">
            <div className="admin-topbar-content">
              <div className="admin-flex admin-items-center admin-gap-md">
                <button 
                  className="admin-mobile-menu-btn"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{display: window.innerWidth <= 768 ? 'block' : 'none'}}
                >
                  <Menu size={24} />
                </button>
                <h2 className="admin-page-title">{activeTab}</h2>
              </div>
              
              {activeTab === 'tests' && (
                <button
                  onClick={() => setShowModal('launchTest')}
                  className="admin-action-btn"
                >
                  <Play size={20} />
                  Launch Test
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="admin-content">
            {error && (
              <div className="admin-error">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="admin-error-close">×</button>
              </div>
            )}
            
            {activeTab === 'overview' && <OverviewContent />}
            {activeTab === 'students' && <StudentsContent />}
            {activeTab === 'tests' && <TestsContent />}
            {activeTab === 'announcements' && <AnnouncementSection />}
            {activeTab === 'rewards' && <RewardSection />}
            {activeTab ==='StudentRegistration' &&  <StudentRegistration onClose={() => setActiveTab('students')} onStudentCreated={handleStudentCreated} /> }
            {activeTab === 'Admin_Student_Group_Management' && <AdminStudentGroupManagement/>}

            
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal === 'launchTest' && <TestLaunchModal />}
      
      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedStudent(null)}>
          <div className="admin-modal" style={{maxWidth: '800px'}}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {selectedStudent.name || selectedStudent.email} - Performance Details
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <div className="admin-stat-info">
                      <h3>Total Games</h3>
                      <p className="admin-stat-number">{selectedStudent.performance?.totalGames || 0}</p>
                    </div>
                    <div className="admin-stat-icon">
                      <BarChart3 size={24} />
                    </div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <div className="admin-stat-info">
                      <h3>Total Score</h3>
                      <p className="admin-stat-number">{selectedStudent.performance?.totalScore || 0}</p>
                    </div>
                    <div className="admin-stat-icon success">
                      <Trophy size={24} />
                    </div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <div className="admin-stat-info">
                      <h3>Accuracy</h3>
                      <p className="admin-stat-number">
                        {selectedStudent.performance?.totalGames ? 
                          ((selectedStudent.performance.totalCorrect / selectedStudent.performance.totalGames) * 100).toFixed(1) 
                          : 0}%
                      </p>
                    </div>
                    <div className="admin-stat-icon info">
                      <Target size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Game History from your existing performance data */}
              {selectedStudent.performance?.history && (
                <div className="admin-section admin-mt-xl">
                  <div className="admin-section-header">
                    <h4 className="admin-section-title">Recent Game History</h4>
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Game Type</th>
                          <th>Score</th>
                          <th>Correct/Total</th>
                          <th>Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.performance.history.slice(0, 10).map((game, index) => (
                          <tr key={index}>
                            <td>{new Date(game.timestamp).toLocaleDateString()}</td>
                            <td style={{textTransform: 'capitalize'}}>{game.gameType}</td>
                            <td style={{fontWeight: 600}}>{game.score}</td>
                            <td>{game.correctAnswers}/{game.count || 20}</td>
                            <td style={{textTransform: 'capitalize'}}>{game.difficulty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button 
                onClick={() => giveRewards(selectedStudent._id, 'stars', 5, 'Great performance!')}
                className="admin-btn admin-btn-outline"
                style={{background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)', borderColor: 'var(--warning-color)'}}
              >
                <Star size={16} />
                Give 5 Stars
              </button>
              <button 
                onClick={() => giveRewards(selectedStudent._id, 'badges', 1, 'Achievement unlocked!')}
                className="admin-btn admin-btn-outline"
                style={{background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: '#8b5cf6'}}
              >
                <Trophy size={16} />
                Give Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="admin-modal-overlay" 
          style={{zIndex: 35}} 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Users, 
//   Search, 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Award, 
//   MessageSquare, 
//   BarChart3, 
//   Download,
//   Clock,
//   Play,
//   Pause,
//   Eye,
//   Star,
//   Trophy,
//   Target,
//   Calendar,
//   Filter,
//   Settings,
//   Bell,
//   Moon,
//   Sun
// } from 'lucide-react';
// import '../../styles/admin/AdminDashboard.css';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
  
//   // Use your existing API URL from the student app
//   const API_URL = 'http://localhost:5000/api';
  
//   // State management
//   const [activeTab, setActiveTab] = useState('overview');
//   const [darkMode, setDarkMode] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedGroup, setSelectedGroup] = useState('all');
//   const [showModal, setShowModal] = useState(null);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Data from your existing backend
//   const [students, setStudents] = useState([]);
//   const [performanceData, setPerformanceData] = useState({});
//   const [announcements, setAnnouncements] = useState([]);
//   const [liveTest, setLiveTest] = useState(null);

//   // Authentication check using your existing auth system
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');

//     if (!token) {
//       navigate('/login');
//       return;
//     }

//     // Verify admin/teacher role using your existing auth endpoint
//     axios.get(`${API_URL}/auth/verify`, {
//       headers: { 
//         Authorization: `${token}`,
//         'X-Device-Id': deviceId 
//       }
//     })
//     .then(response => {
//       // Check if user has admin/teacher privileges
//       // You may need to add a role field to your User model
//       if (response.data.role !== 'teacher') {
//         alert('Access denied. Teacher privileges required.');
//         navigate('/');
//         return;
//       }
//       loadDashboardData();
//     })
//     .catch(err => {
//       console.error("Authentication error:", err);
//       localStorage.removeItem('token');
//       navigate('/login');
//     });
//   }, [navigate]);

//   const loadDashboardData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         loadStudents(),
//         loadAnnouncements(),
//         loadPerformanceStats()
//       ]);
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load all students using your existing backend
//   const loadStudents = async () => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');
    
//     try {
//       // Since your backend doesn't have a specific admin endpoint yet,
//       // we'll extend your existing auth verification to return user lists for teachers
//       const response = await axios.get(`${API_URL}/admin/students`, {
//         headers: { 
//           Authorization: `${token}`,
//           'X-Device-Id': deviceId 
//         }
//       });
      
//       setStudents(response.data || []);
//     } catch (error) {
//       console.error('Error loading students:', error);
//       // Fallback: create mock data structure matching your existing user model
//       setStudents([]);
//     }
//   };

//   // Load performance data for all students using your existing performance endpoint
//   const loadPerformanceStats = async () => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');
    
    
//     const stats = {};
    
//     for (const student of students) {
//       try {
//         const response = await axios.get(`${API_URL}/performance/${student.userId}`, {
//           headers: { 
//             Authorization: `${token}`,
//             'X-Device-Id': deviceId 
//           }
//         });
        
//         if (response.data) {
//           stats[student.userId] = response.data;
//         }
//       } catch (error) {
//         console.error(`Error loading performance for ${student.userId}:`, error);
//       }
//     }
    
//     setPerformanceData(stats);
//   };

//   // Create new student using your existing backend structure
//   const createStudent = async (studentData) => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');
    
//     try {
//       // This would require extending your backend to handle student creation by admins
//       const response = await axios.post(`${API_URL}/admin/students`, {
//         ...studentData,
//         role: 'student'
//       }, {
//         headers: { 
//           Authorization: `${token}`,
//           'X-Device-Id': deviceId,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data) {
//         await loadStudents(); // Refresh the list
//         setShowModal(null);
//       }
//     } catch (error) {
//       console.error('Error creating student:', error);
//       setError('Failed to create student');
//     }
//   };

//   // Launch test - this would integrate with your existing game system
//   const launchTest = async (testConfig) => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');
    
//     try {
//       // This would require new endpoints in your backend
//       const response = await axios.post(`${API_URL}/admin/tests/launch`, testConfig, {
//         headers: { 
//           Authorization: `${token}`,
//           'X-Device-Id': deviceId,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data) {
//         setLiveTest(response.data.test);
//         setShowModal(null);
//       }
//     } catch (error) {
//       console.error('Error launching test:', error);
//       setError('Failed to launch test');
//     }
//   };

//   // Give rewards to student - extends your existing performance tracking
//   const giveRewards = async (studentId, rewardType, amount, note) => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');
    
//     try {
//       // This would extend your existing performance update system
//       const response = await axios.post(`${API_URL}/admin/rewards`, {
//         studentId,
//         rewardType, // 'stars' or 'badges'
//         amount,
//         note
//       }, {
//         headers: { 
//           Authorization: `${token}`,
//           'X-Device-Id': deviceId,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data) {
//         // Refresh student data
//         await loadStudents();
//       }
//     } catch (error) {
//       console.error('Error giving rewards:', error);
//       setError('Failed to give rewards');
//     }
//   };

//   // Create announcement
//   const createAnnouncement = async (announcementData) => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');
    
//     try {
//       const response = await axios.post(`${API_URL}/admin/announcements`, announcementData, {
//         headers: { 
//           Authorization: `${token}`,
//           'X-Device-Id': deviceId,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data) {
//         await loadAnnouncements();
//         setShowModal(null);
//       }
//     } catch (error) {
//       console.error('Error creating announcement:', error);
//       setError('Failed to create announcement');
//     }
//   };

//   const loadAnnouncements = async () => {
//     const token = localStorage.getItem('token');
//     const deviceId = localStorage.getItem('deviceId');
    
//     try {
//       const response = await axios.get(`${API_URL}/admin/announcements`, {
//         headers: { 
//           Authorization: `${token}`,
//           'X-Device-Id': deviceId 
//         }
//       });
      
//       setAnnouncements(response.data || []);
//     } catch (error) {
//       console.error('Error loading announcements:', error);
//       setAnnouncements([]);
//     }
//   };

//   // Export performance data using your existing data structure
//   const exportPerformanceData = () => {
//     const csvData = students.map(student => {
//       const perf = performanceData[student.userId];
//       return {
//         Name: student.name || student.email,
//         Email: student.email,
//         TotalGames: perf?.totalGames || 0,
//         TotalCorrect: perf?.totalCorrect || 0,
//         TotalScore: perf?.totalScore || 0,
//         Accuracy: perf ? ((perf.totalCorrect / perf.totalGames) * 100).toFixed(2) : '0.00'
//       };
//     });

//     // Convert to CSV
//     const csvHeaders = Object.keys(csvData[0]).join(',');
//     const csvRows = csvData.map(row => Object.values(row).join(','));
//     const csvContent = [csvHeaders, ...csvRows].join('\n');

//     // Download
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'student_performance.csv';
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   // Filter students based on search and group
//   const filteredStudents = students.filter(student => {
//     const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesGroup = selectedGroup === 'all' || student.group === selectedGroup;
//     return matchesSearch && matchesGroup;
//   });

//   // Overview statistics calculated from your existing data
//   const calculateStats = () => {
//     const totalStudents = students.length;
//     const totalGames = Object.values(performanceData).reduce((sum, p) => sum + (p.totalGames || 0), 0);
//     const avgAccuracy = Object.values(performanceData).length > 0 
//       ? Object.values(performanceData).reduce((sum, p) => sum + ((p.totalCorrect || 0) / (p.totalGames || 1) * 100), 0) / Object.values(performanceData).length
//       : 0;

//     return {
//       totalStudents,
//       totalGames,
//       avgAccuracy: Math.round(avgAccuracy * 100) / 100
//     };
//   };

//   const stats = calculateStats();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
//         </div>
//       </div>
//     );
//   }

//   // Test Launch Modal using your existing game types
//   const TestLaunchModal = () => {
//     const [testConfig, setTestConfig] = useState({
//       duration: 10,
//       gameType: 'multiplication', // Use your existing game types
//       difficulty: 'double',
//       speed: 2,
//       count: 10,
//       targetStudents: 'all'
//     });

//     const handleLaunchTest = () => {
//       launchTest(testConfig);
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
//           <h3 className="text-lg font-semibold mb-4">Launch New Test</h3>
          
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Game Type</label>
//               <select 
//                 value={testConfig.gameType} 
//                 onChange={(e) => setTestConfig({...testConfig, gameType: e.target.value})}
//                 className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
//               >
//                 <option value="multiplication">Multiplication</option>
//                 <option value="addition">Addition</option>
//                 <option value="subtraction">Subtraction</option>
//                 <option value="division">Division</option>
//                 <option value="mixedMath">Mixed Math</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Difficulty</label>
//               <select 
//                 value={testConfig.difficulty}
//                 onChange={(e) => setTestConfig({...testConfig, difficulty: e.target.value})}
//                 className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
//               >
//                 <option value="single">Single Digit</option>
//                 <option value="double">Double Digit</option>
//                 <option value="triple">Triple Digit</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Speed (seconds)</label>
//               <input 
//                 type="number"
//                 value={testConfig.speed}
//                 onChange={(e) => setTestConfig({...testConfig, speed: parseInt(e.target.value)})}
//                 min="1"
//                 max="10"
//                 className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Number of Questions</label>
//               <input 
//                 type="number"
//                 value={testConfig.count}
//                 onChange={(e) => setTestConfig({...testConfig, count: parseInt(e.target.value)})}
//                 min="5"
//                 max="50"
//                 className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
//               <input 
//                 type="number"
//                 value={testConfig.duration}
//                 onChange={(e) => setTestConfig({...testConfig, duration: parseInt(e.target.value)})}
//                 min="5"
//                 max="60"
//                 className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>
//           </div>

//           <div className="flex gap-2 mt-6">
//             <button 
//               onClick={handleLaunchTest}
//               className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//             >
//               Launch Test
//             </button>
//             <button 
//               onClick={() => setShowModal(null)}
//               className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Overview Tab Content using your existing data structure
//   const OverviewContent = () => (
//     <div className="space-y-6">
//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
//             </div>
//             <Users className="h-8 w-8 text-blue-600" />
//           </div>
//         </div>
        
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Accuracy</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgAccuracy}%</p>
//             </div>
//             <Target className="h-8 w-8 text-green-600" />
//           </div>
//         </div>

//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Games</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGames}</p>
//             </div>
//             <BarChart3 className="h-8 w-8 text-purple-600" />
//           </div>
//         </div>

//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Announcements</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{announcements.length}</p>
//             </div>
//             <Bell className="h-8 w-8 text-yellow-600" />
//           </div>
//         </div>
//       </div>

//       {/* Recent Activity using your existing performance data */}
//       <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
//         <h3 className="text-lg font-semibold mb-4">Recent Student Activity</h3>
//         <div className="space-y-3">
//           {students.slice(0, 5).map(student => {
//             const perf = performanceData[student.userId];
//             const accuracy = perf ? ((perf.totalCorrect / perf.totalGames) * 100).toFixed(1) : 0;
            
//             return (
//               <div key={student.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
//                 <div>
//                   <p className="font-medium">{student.name || student.email}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">
//                     Last active: Recent
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-medium">{accuracy}% accuracy</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">
//                     {perf?.totalGames || 0} games played
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );

//   // Students Tab Content integrated with your backend
//   const StudentsContent = () => (
//     <div className="space-y-6">
//       {/* Search and Filter Bar */}
//       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search students..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//             />
//           </div>
//           <button
//             onClick={exportPerformanceData}
//             className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
//           >
//             <Download size={20} />
//             Export CSV
//           </button>
//         </div>
//       </div>

//       {/* Students Table with your existing data */}
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Student
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Performance
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Total Games
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//               {filteredStudents.map((student) => {
//                 const perf = performanceData[student.userId] || {};
//                 const accuracy = perf.totalGames ? ((perf.totalCorrect / perf.totalGames) * 100).toFixed(1) : 0;
                
//                 return (
//                   <tr key={student.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900 dark:text-white">
//                           {student.name || 'No Name'}
//                         </div>
//                         <div className="text-sm text-gray-500 dark:text-gray-400">
//                           {student.email}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900 dark:text-white">
//                           {accuracy}% accuracy
//                         </div>
//                         <div className="text-sm text-gray-500 dark:text-gray-400">
//                           {perf.totalCorrect || 0}/{perf.totalGames || 0} correct
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                       {perf.totalGames || 0}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => setSelectedStudent({...student, performance: perf})}
//                           className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
//                         >
//                           <Eye size={16} />
//                         </button>
//                         <button 
//                           onClick={() => giveRewards(student.userId, 'stars', 1, 'Good work!')}
//                           className="text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-400"
//                         >
//                           <Star size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
//       <div className="flex h-screen">
//         {/* Sidebar */}
//         <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
//           <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//             <h1 className="text-xl font-bold text-gray-900 dark:text-white">
//               Teacher Dashboard
//             </h1>
//           </div>
          
//           <nav className="mt-6">
//             <div className="px-4 space-y-2">
//               {[
//                 { id: 'overview', label: 'Overview', icon: BarChart3 },
//                 { id: 'students', label: 'Students', icon: Users },
//                 { id: 'tests', label: 'Tests', icon: Target }
//               ].map(tab => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
//                     activeTab === tab.id 
//                       ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
//                       : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                   }`}
//                 >
//                   <tab.icon size={20} />
//                   {tab.label}
//                 </button>
//               ))}
//             </div>
//           </nav>
          
//           <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
//             <button
//               onClick={() => setDarkMode(!darkMode)}
//               className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//             >
//               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//               {darkMode ? 'Light Mode' : 'Dark Mode'}
//             </button>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 overflow-hidden">
//           {/* Top Bar */}
//           <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
//             <div className="px-6 py-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
//                     {activeTab}
//                   </h2>
//                 </div>
                
//                 {activeTab === 'tests' && (
//                   <button
//                     onClick={() => setShowModal('launchTest')}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                   >
//                     <Play size={20} />
//                     Launch Test
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

// {activeTab === 'tests' && (
//   <div className="space-y-6">
//     <div className="adminDash-test-quick-stats">
//       <div className="adminDash-quick-stat-item">
//         <div className="adminDash-quick-stat-number">12</div>
//         <div className="adminDash-quick-stat-label">Active Tests</div>
//       </div>
//       <div className="adminDash-quick-stat-item">
//         <div className="adminDash-quick-stat-number">45</div>
//         <div className="adminDash-quick-stat-label">Completed</div>
//       </div>
//       <div className="adminDash-quick-stat-item">
//         <div className="adminDash-quick-stat-number">89%</div>
//         <div className="adminDash-quick-stat-label">Success Rate</div>
//       </div>
//     </div>
    
//     <div className="adminDash-tests-management-section">
//       <div className="adminDash-test-history-card">
//         <h3>Recent Tests</h3>
//         <p>View and manage recently launched tests</p>
//       </div>
//       <div className="adminDash-test-settings-card">
//         <h3>Test Templates</h3>
//         <p>Create and save test configurations</p>
//       </div>
//     </div>
//   </div>
// )}

//           {/* Content Area */}
//           <div className="flex-1 overflow-y-auto p-6">
//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                 {error}
//                 <button onClick={() => setError(null)} className="float-right">×</button>
//               </div>
//             )}
            
//             {activeTab === 'overview' && <OverviewContent />}
//             {activeTab === 'students' && <StudentsContent />}
//             {activeTab === 'tests' &&  <TestLaunchModal />
//             // (
//             //   <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
//             //     <h3 className="text-lg font-semibold mb-4">Test Management</h3>
//             //     <p className="text-gray-600 dark:text-gray-400">
//             //       Launch tests for your students using the button above. Tests will use your existing game types and difficulty settings.
//             //     </p>
//             //   </div>
//             // )
//             }
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {showModal === 'launchTest' && <TestLaunchModal />}
      
//       {/* Student Detail Modal */}
//       {selectedStudent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-90vh overflow-y-auto">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-xl font-semibold">
//                 {selectedStudent.name || selectedStudent.email} - Performance Details
//               </h3>
//               <button
//                 onClick={() => setSelectedStudent(null)}
//                 className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
//                 <h4 className="font-medium text-blue-800 dark:text-blue-300">Total Games</h4>
//                 <p className="text-2xl font-bold text-blue-600">
//                   {selectedStudent.performance?.totalGames || 0}
//                 </p>
//               </div>
//               <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
//                 <h4 className="font-medium text-green-800 dark:text-green-300">Total Score</h4>
//                 <p className="text-2xl font-bold text-green-600">
//                   {selectedStudent.performance?.totalScore || 0}
//                 </p>
//               </div>
//               <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
//                 <h4 className="font-medium text-purple-800 dark:text-purple-300">Accuracy</h4>
//                 <p className="text-2xl font-bold text-purple-600">
//                   {selectedStudent.performance?.totalGames ? 
//                     ((selectedStudent.performance.totalCorrect / selectedStudent.performance.totalGames) * 100).toFixed(1) 
//                     : 0}%
//                 </p>
//               </div>
//             </div>

//             {/* Game History from your existing performance data */}
//             {selectedStudent.performance?.history && (
//               <div className="mt-6">
//                 <h4 className="font-medium mb-4">Recent Game History</h4>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full border">
//                     <thead className="bg-gray-50 dark:bg-gray-700">
//                       <tr>
//                         <th className="px-4 py-2 text-left">Date</th>
//                         <th className="px-4 py-2 text-left">Game Type</th>
//                         <th className="px-4 py-2 text-left">Score</th>
//                         <th className="px-4 py-2 text-left">Correct/Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedStudent.performance.history.slice(0, 10).map((game, index) => (
//                         <tr key={index} className="border-b">
//                           <td className="px-4 py-2">{new Date(game.timestamp).toLocaleDateString()}</td>
//                           <td className="px-4 py-2">{game.gameType}</td>
//                           <td className="px-4 py-2">{game.score}</td>
//                           <td className="px-4 py-2">{game.correct}/{game.total || 20}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             <div className="flex gap-3 mt-6">
//               <button 
//                 onClick={() => giveRewards(selectedStudent.userId, 'stars', 5, 'Great performance!')}
//                 className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center gap-2"
//               >
//                 <Star size={16} />
//                 Give 5 Stars
//               </button>
//               <button 
//                 onClick={() => giveRewards(selectedStudent.userId, 'badges', 1, 'Achievement unlocked!')}
//                 className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-2"
//               >
//                 <Trophy size={16} />
//                 Give Badge
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;