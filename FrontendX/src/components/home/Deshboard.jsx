import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is installed
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Netflix from "../../components/home/netflix";
import { ThreeDot } from 'react-loading-indicators';
import vendorLogoUrl  from '../../styles/logo/logo.jpg'; 
import vendorInitial from '../../styles/logo/logo.jpg';

// import { Bar, Line } from 'recharts';
import "../../styles/home/Deshboard.css"
import { Navigate } from 'react-router-dom';

const MobilePerformanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
  

  // Auth state
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);  
const [loading, setLoading] = useState(true); // Add loading state
  const [showImage, setShowImage] = useState(false);
    const [announcementStats, setAnnouncementStats] = useState({ unreadCount: 0 });
  // Sample data based on your provided structure
  const [performanceData, setPerformanceData] = useState({
    totalGames: 0,
    totalCorrect: 0,
    totalScore: 0,
    gameTypes: {},
    dailyStats: {},
    history: []
  });

  // Add these new state variables
// Add persistent cache state
const [cachedData, setCachedData] = useState(null);
const [isBackgroundSync, setIsBackgroundSync] = useState(false);
const [lastSyncTime, setLastSyncTime] = useState(0);
const BACKGROUND_SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes
  
  // API configuration
  const API_URL = 'http://localhost:5000/api';


  
  // Check authentication on load
// In your initial useEffect
useEffect(() => {
  const token = localStorage.getItem('token');
  const deviceId = localStorage.getItem('deviceId');
  console.log("Fetching user data for UID:", "with token:", token);

  if (token) {
    console.log("Found token, verifying...");
    // Verify token and get user ID
    axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `${token}`,
      'X-Device-Id': deviceId }
    })
    .then(response => {
      console.log("Token verified successfully", response.data);
      setUserId(response.data);
      fetchUserData(response.data.userId);
    })
    .catch(err => {
      console.error("Authentication error:", err);
      // If token is invalid, remove it
      localStorage.removeItem('token');
      // setIsLoading(false);
      
      // Fallback to local data
      loadLocalData();
    });
  } else {
    console.log("No token found, loading local data");
    // No token, load from localStorage as fallback
    loadLocalData();
    // setIsLoading(false);
  }
}, []);
  
  // Load data from localStorage (fallback when user is not logged in)
  const loadLocalData = () => {
    const savedData = localStorage.getItem('avecusPerformance');
    if (savedData) {
      try {
        setPerformanceData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error parsing saved performance data", e);
      }
    }
  };
  
  // Fetch user data from server
// Modify your fetchUserData function to better handle errors
const fetchUserData = (uid) => {
  const token = localStorage.getItem('token');
  const deviceId = localStorage.getItem('deviceId');
console.log("Fetching user data for UID:", uid, "with token:", token);
  setIsLoading(true);
  axios.get(`${API_URL}/performance/${uid}`, {
          headers: { Authorization: `${token}`,
      'X-Device-Id': deviceId }
  })

    .then(response => {
      if (response.data) {
        console.log("Successfully loaded data from server:", response.data);
        setPerformanceData(response.data);
      } else {
        console.log("No data found on server, initializing empty structure");
        // If no data found, initialize with empty structure
        const emptyData = {
          totalGames: 0,
          totalCorrect: 0,
          totalScore: 0,
          gameTypes: {},
          dailyStats: {},
          history: []
        };
        setPerformanceData(emptyData);
      }
      // setIsLoading(false);
    })
    .catch(err => {
      console.error("Error fetching user data:", err);
      setError("Could not load your data. Using local data instead.");
      loadLocalData();
      // setIsLoading(false);
    });
};
  // Generate some fake history data for visualization
  const extendedHistory = [
    { date: "2025-03-17", score: 0, correct: 0, plays: 0 },
    { date: "2025-03-18", score: 2, correct: 2, plays: 3 },
    { date: "2025-03-19", score: 4, correct: 3, plays: 5 },
    { date: "2025-03-20", score: 3, correct: 2, plays: 4 },
    { date: "2025-03-21", score: 5, correct: 4, plays: 6 },
    { date: "2025-03-22", score: 1, correct: 1, plays: 1 },
  ];

  // Create data for game type distribution chart
  const gameTypeData = Object.entries(performanceData.gameTypes).map(([type, data]) => ({
    name: type,
    plays: data.plays,
    score: data.score
  }));

  // Calculate accuracy rate
  // const accuracyRate = performanceData.totalGames > 0 
  //   ? (performanceData.totalCorrect / performanceData.totalGames * 100).toFixed(0) 
  //   : 0;

  // const accuracyRate = performanceData.totalGames > 0 
  // ? Math.round((performanceData.totalCorrect / performanceData.totalGames) * 100)
  // : 0;

    const accuracyRate = performanceData.totalGames > 0 
  ? Math.round((performanceData.totalCorrect / performanceData.totalGames) * 100)
  : 0;

const speedRate = performanceData.history.length
  ? Math.round(
      performanceData.history.reduce((sum, h) => sum + (h.speed || 0), 0) /
      performanceData.history.length * 100
    )
  : 0;

const gameDistribution = Object.entries(performanceData.gameTypes || {});

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
    //----------------------------------------- pasted

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    };

  // Get current date string in format YYYY-MM-DD (unchanged)
  const getCurrentDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const today = getCurrentDateString();
  const todayStats = performanceData.dailyStats[today] || { plays: 0, correct: 0, score: 0 };
  
  // Get last 7 days for chart
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const stats = performanceData.dailyStats[dateString] || { plays: 0, correct: 0, score: 0 };
    last7Days.push({
      date: formatDate(dateString),
      score: stats.score,
      gamesPlayed: stats.plays
    });
  }

  
  const getMonthlyWeeksData = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get first day of current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Calculate weeks in current month
  const weeks = [];
  let currentWeekStart = new Date(firstDayOfMonth);
  
  // Adjust to start from Monday of the first week
  const dayOfWeek = currentWeekStart.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  currentWeekStart.setDate(currentWeekStart.getDate() - daysToMonday);
  
  let weekNumber = 1;
  
  while (currentWeekStart <= lastDayOfMonth && weekNumber <= 5) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Only include weeks that have days in current month
    if (weekEnd >= firstDayOfMonth) {
      // Calculate stats for this week
      let weekStats = { plays: 0, correct: 0, score: 0 };
      
      for (let d = new Date(Math.max(currentWeekStart, firstDayOfMonth)); 
           d <= Math.min(weekEnd, lastDayOfMonth); 
           d.setDate(d.getDate() + 1)) {
        const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayStats = performanceData.dailyStats[dateString] || { plays: 0, correct: 0, score: 0 };
        
        weekStats.plays += dayStats.plays;
        weekStats.correct += dayStats.correct;
        weekStats.score += dayStats.score;
      }
      
      weeks.push({
        week: `Week ${weekNumber}`,
        gamesPlayed: weekStats.plays,
        score: weekStats.score
      });
    }
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }
  
  // Ensure we have at least 4 weeks for consistent display
  while (weeks.length < 4) {
    weeks.push({
      week: `Week ${weeks.length + 1}`,
      gamesPlayed: 0,
      score: 0
    });
  }
  
  return weeks.slice(0, 5); // Max 5 weeks
};

const getWeekdaysData = () => {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weekdaysData = [];
  
  // Get Monday of current week
  const currentDay = today.getDay();
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const stats = performanceData.dailyStats[dateString] || { plays: 0, correct: 0, score: 0 };
    
    weekdaysData.push({
      day: weekdays[i],
      score: Math.min(stats.score, 20), // Cap score at 20 to prevent overflow
      gamesPlayed: Math.min(stats.plays, 20) // Cap games at 20 to prevent overflow
    });
  }
  
  return weekdaysData;
};

// 3. Updated chart rendering with overflow protection
const renderMonthlyProgressChart = (monthlyWeeks) => {
  const maxValue = Math.max(
    ...monthlyWeeks.map(d => Math.max(d.score, d.gamesPlayed)),
    10 // Minimum scale
  );
  
  // Cap the maximum value to prevent extreme scaling
  const cappedMaxValue = Math.min(maxValue, 50);
  
  return (
    <svg viewBox="0 0 400 200" className="w-full h-full">
      {/* Score line */}
      <path
        d={
          monthlyWeeks
            .map((d, i) => {
              const x = 50 + i * 80;
              const y = 150 - (Math.min(d.score, cappedMaxValue) / cappedMaxValue) * 120;
              return `${i === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ")
        }
        fill="none"
        stroke="#ec4899"
        strokeWidth="3"
      />
      
      {/* Games played line */}
      <path
        d={
          monthlyWeeks
            .map((d, i) => {
              const x = 50 + i * 80;
              const y = 150 - (Math.min(d.gamesPlayed, cappedMaxValue) / cappedMaxValue) * 120;
              return `${i === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ")
        }
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="3"
      />

      {/* Score points */}
      {monthlyWeeks.map((d, i) => {
        const x = 50 + i * 80;
        const y = 150 - (Math.min(d.score, cappedMaxValue) / cappedMaxValue) * 120;
        return <circle key={`s-${i}`} cx={x} cy={y} r="4" fill="#ec4899" />;
      })}

      {/* Games played points */}
      {monthlyWeeks.map((d, i) => {
        const x = 50 + i * 80;
        const y = 150 - (Math.min(d.gamesPlayed, cappedMaxValue) / cappedMaxValue) * 120;
        return <circle key={`g-${i}`} cx={x} cy={y} r="4" fill="#8b5cf6" />;
      })}

      {/* X-axis labels */}
      {monthlyWeeks.map((d, i) => {
        const x = 50 + i * 80;
        return (
          <text
            key={`t-${i}`}
            x={x}
            y={180}
            textAnchor="middle"
            className="fill-slate-400 text-xs"
          >
            W{i + 1}
          </text>
        );
      })}
    </svg>
  );
};

// 4. Updated weekdays chart with overflow protection
const renderWeekdaysChart = (weekdaysData) => {
  const maxValue = Math.max(
    ...weekdaysData.map(d => Math.max(d.score, d.gamesPlayed)),
    10 // Minimum scale
  );
  
  // Cap the maximum value to prevent overflow
  const cappedMaxValue = Math.min(maxValue, 30);
  
  return (
    <svg viewBox="20 0 400 200" className="w-full h-full">
      {/* Score line */}
      <path
        d={
          weekdaysData
            .map((d, i) => {
              const x = 50 + i * 70;
              const y = 150 - (Math.min(d.score, cappedMaxValue) / cappedMaxValue) * 120;
              return `${i === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ")
        }
        fill="none"
        stroke="#ec4899"
        strokeWidth="3"
      />
      
      {/* Games played line */}
      <path
        d={
          weekdaysData
            .map((d, i) => {
              const x = 50 + i * 70;
              const y = 150 - (Math.min(d.gamesPlayed, cappedMaxValue) / cappedMaxValue) * 120;
              return `${i === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ")
        }
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="3"
      />

      {/* Score points */}
      {weekdaysData.map((d, i) => {
        const x = 50 + i * 70;
        const y = 150 - (Math.min(d.score, cappedMaxValue) / cappedMaxValue) * 120;
        return <circle key={`s-${i}`} cx={x} cy={y} r="4" fill="#ec4899" />;
      })}

      {/* Games played points */}
      {weekdaysData.map((d, i) => {
        const x = 50 + i * 70;
        const y = 150 - (Math.min(d.gamesPlayed, cappedMaxValue) / cappedMaxValue) * 120;
        return <circle key={`g-${i}`} cx={x} cy={y} r="4" fill="#8b5cf6" />;
      })}

      {/* X-axis labels */}
      {weekdaysData.map((d, i) => {
        const x = 50 + i * 70;
        return (
          <text
            key={`t-${i}`}
            x={x}
            y={180}
            textAnchor="middle"
            className="fill-slate-400 text-xs"
          >
            {d.day}
          </text>
        );
      })}
    </svg>
  );
};


    

  // useEffect(() => {
  //   const currentTime = Date.now();
  //   const lastShownTime = localStorage.getItem("lastShownTime");
    
  //   if (!lastShownTime || currentTime - Number(lastShownTime) >= 15000) {
  //     setShowImage(true);
      
  //     const timer = setTimeout(() => {
  //       setShowImage(false);
  //       localStorage.setItem("lastShownTime", Date.now().toString()); // Move inside timeout
  //     }, 5000);
    
  //     return () => clearTimeout(timer);
  //   }
  //   }, []);

    // nngnngngmglmflmlfmldfmmlmmdlfmdfmg cvkfgknkgdkgfk

    

// 1. Replace the existing Game Distribution section in the 'overview' tab with this improved version:

// Add this helper function after the existing helper functions (around line 180)
const getGameDistributionData = () => {
  const gameTypes = performanceData.gameTypes || {};
  
  // Convert to array and sort by plays (descending)
  const sortedGames = Object.entries(gameTypes)
    .map(([type, data]) => ({
      name: type,
      plays: data.plays || 0,
      score: data.score || 0,
      percentage: performanceData.totalGames > 0 ? 
        ((data.plays || 0) / performanceData.totalGames * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 6); // Show top 6 games

  return sortedGames;
};


    useEffect(() => {
  const initializeWithCache = async () => {
    // 1. IMMEDIATELY load cached data (no loading screen)
    const savedData = localStorage.getItem('avecusPerformance');
    const savedSyncTime = localStorage.getItem('lastSyncTime');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPerformanceData(parsed);
        setCachedData(parsed);
        setLastSyncTime(Number(savedSyncTime) || 0);
        console.log("✓ Instant load from cache");
      } catch (e) {
        console.error("Cache parse error:", e);
      }
    }
    
    // 2. Then handle auth and background sync
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `${token}`, 'X-Device-Id': deviceId }
        });
        
        setUserId(response.data);
        
        // 3. Background sync without disrupting UI
        backgroundSyncData(response.data.userId);
        
      } catch (err) {
        console.error("Auth failed, using cache:", err);
        localStorage.removeItem('token');
      }
    }
    
    setIsLoading(false);
  };

  initializeWithCache();
}, []);

const backgroundSyncData = async (uid) => {
  const now = Date.now();
  
  // Skip if recently synced
  if (now - lastSyncTime < BACKGROUND_SYNC_INTERVAL) {
    console.log("⏳ Skipping sync - too recent");
    return;
  }
  
  setIsBackgroundSync(true);
  const token = localStorage.getItem('token');
  const deviceId = localStorage.getItem('deviceId');
  
  try {
    console.log("🔄 Background syncing...");
    
    const response = await axios.get(`${API_URL}/performance/${uid}`, {
      headers: { Authorization: `${token}`, 'X-Device-Id': deviceId },
      timeout: 5000
    });

    if (response.data) {
      const serverData = response.data;
      
      // Compare and update only if different
      if (JSON.stringify(serverData) !== JSON.stringify(cachedData)) {
        console.log("📥 New data received, updating...");
        setPerformanceData(serverData);
        setCachedData(serverData);
        
        // Persist to localStorage
        localStorage.setItem('avecusPerformance', JSON.stringify(serverData));
        localStorage.setItem('lastSyncTime', now.toString());
        setLastSyncTime(now);
      } else {
        console.log("✓ Data unchanged");
        setLastSyncTime(now);
        localStorage.setItem('lastSyncTime', now.toString());
      }
    }
  } catch (err) {
    console.error("Background sync failed:", err);
  } finally {
    setIsBackgroundSync(false);
  }
};

// Add automatic background sync every few minutes
useEffect(() => {
  if (!userId?.userId) return;
  
  const interval = setInterval(() => {
    backgroundSyncData(userId.userId);
  }, BACKGROUND_SYNC_INTERVAL);
  
  return () => clearInterval(interval);
}, [userId]);
    
    
    if (showImage) {
    return (
      <div
        className="loading-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          backgroundColor: "#f9f9f9",
        }}
      >
        {showImage ? (
    
          <Netflix />
        ) : (
          <ThreeDot color="#32cd32" size="medium" text="" textColor="" />
        )}
      </div>
    );
    }

  return (
<div className="mpd-container bg-slate-900 text-white min-h-screen">
     {/* <div className="mpd-container bg-slate-900 text-white min-h-screen"> */}
      {/* <div className="mpd-header p-4 border-b border-slate-700 flex items-center justify-between">


        <div className="mpd-logo flex items-center">
          <div className="mpd-logo-circle bg-pink-600 h-10 w-10 rounded-full flex items-center justify-center overflow-hidden">
            {vendorLogoUrl ? (
              <img 
                src={vendorLogoUrl} 
                alt="Vendor Logo" 
                className="h-8 w-8 object-cover rounded-full"
                style={{ 
                  objectFit: 'cover',
                  transform: 'scale(1.2)',
                  imageRendering: 'crisp-edges'
                }}
              />
            ) : (
              <span className="text-white font-bold text-lg">{vendorInitial || 'B'}</span>
            )}
          </div>
          <span className="ml-2 font-bold">{userId?.name}</span>
        </div>



        <div className="mpd-actions flex items-center">
          <button className="mpd-search-btn mr-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="mpd-notification-btn mr-2 relative">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="mpd-badge absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 flex items-center justify-center text-xs">1</span>
          </button>
          <button className="mpd-profile-btn">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="font-bold text-xs">{userId?.name?.charAt(0)}</span>
            </div>
          </button>
        </div>
      </div> */}

      <div className="mpd-header p-4 border-b border-slate-700 flex items-center justify-between">
  <div className="mpd-logo flex items-center">
    <div className="mpd-logo-circle bg-pink-600 h-10 w-10 rounded-full flex items-center justify-center overflow-hidden">
      {vendorLogoUrl ? (
        <img 
          src={vendorLogoUrl} 
          alt="Vendor Logo" 
          className="h-8 w-8 object-cover rounded-full"
          style={{ 
            objectFit: 'cover',
            transform: 'scale(1.2)',
            imageRendering: 'crisp-edges'
          }}
        />
      ) : (
        <span className="text-white font-bold text-lg">{vendorInitial || 'B'}</span>
      )}
    </div>
    <span className="ml-2 font-bold">{userId?.name}</span>
    {isBackgroundSync && (
      <div className="ml-2 flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-400 ml-1">syncing...</span>
      </div>
    )}
  </div>
  
  <div className="mpd-actions flex items-center">
    {/* <button className="mpd-search-btn mr-2">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button> */}
  <button   onClick={() => navigate('/StudentRewards')}
  className="rewards-nav-btn"
  style={{
    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
    color: '#333',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
  }
  }
  >
            {/* <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg> */}
            <span>⭐</span>
          </button>

                    <button 
  onClick={() => navigate('/announcements')}
  style={{
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    margin: '10px 10px ',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    position: 'relative'
  }}
>
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
  {announcementStats.unreadCount > 0 && (
    <span style={{
      background: '#ff4757',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '10px',
      fontSize: '12px',
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      minWidth: '18px',
      textAlign: 'center'
    }}>
      {announcementStats.unreadCount}
    </span>
  )}
</button> 
    <button 
      className="mpd-notification-btn mr-2 relative"
      onClick={() => backgroundSyncData(userId?.userId)} // Manual sync
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
    <button className="mpd-profile-btn">
      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
        <span className="font-bold text-xs">{userId?.name?.charAt(0)}</span>
      </div>
    </button>
  </div>
</div>

{/* Desktop Sidebar */}
<div className="mpd-sidebar hidden lg:block">
  <div className="mpd-sidebar-nav">
    <button 
      className={`mpd-sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
      onClick={() => setActiveTab('overview')}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Overview
    </button>
    <button 
      className={`mpd-sidebar-btn ${activeTab === 'history' ? 'active' : ''}`}
      onClick={() => setActiveTab('history')}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      History
    </button>
    <button 
      className={`mpd-sidebar-btn ${activeTab === 'stats' ? 'active' : ''}`}
      onClick={() => setActiveTab('stats')}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      Statistics
    </button>
  </div>
</div>

{/* Mobile Tabs - Keep Original */}
<div className="mpd-tabs px-4 pt-4 flex overflow-x-auto lg:hidden">
  <button 
    className={`mpd-tab-btn mr-4 pb-2 ${activeTab === 'overview' ? 'border-b-2 border-purple-500 font-bold' : 'text-slate-400'}`}
    onClick={() => setActiveTab('overview')}
  >
    Overview
  </button>
  <button 
    className={`mpd-tab-btn mr-4 pb-2 ${activeTab === 'history' ? 'border-b-2 border-purple-500 font-bold' : 'text-slate-400'}`}
    onClick={() => setActiveTab('history')}
  >
    History
  </button>
  <button 
    className={`mpd-tab-btn mr-4 pb-2 ${activeTab === 'stats' ? 'border-b-2 border-purple-500 font-bold' : 'text-slate-400'}`}
    onClick={() => setActiveTab('stats')}
  >
    Statistics
  </button>
</div>

<div className="mpd-main-content lg:block">
    <div className="mpd-main-content">

  {activeTab === 'overview' && (
    <div className="mpd-overview p-4">
          <div className="mpd-stats-grid grid grid-cols-2 gap-4 mb-6">
            <div className="mpd-stat-card bg-slate-800 rounded-xl p-4">
              <div className="mpd-accuracy-circle relative flex items-center justify-center mb-2">
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    className="stroke-slate-700" 
                    strokeWidth="10" 
                    fill="none" 
                  />
                  <circle 
                    cx="50" cy="50" r="45" 
                    className="stroke-pink-500" 
                    strokeWidth="10" 
                    fill="none" 
                    strokeDasharray="283" 
                    strokeDashoffset={`${283 - (283 * accuracyRate / 100)}`}
                    transform="rotate(-90 50 50)" 
                  />
                  <text x="50" y="50" dominantBaseline="middle" textAnchor="middle" className="fill-white font-bold text-xl">
                    {accuracyRate}%
                  </text>
                </svg>
              </div>
              <div className="mpd-stat-label text-center text-sm text-slate-300">Accuracy Rate</div>
            </div>
            <div className="mpd-stat-card bg-slate-800 rounded-xl p-4">
              <div className="mpd-stats-content">
                <div className="mpd-stats-row flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">Total Games</span>
                  <span className="font-bold">{performanceData.totalGames}</span>
                </div>
                <div className="mpd-stats-row flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">Correct</span>
                  <span className="font-bold text-green-500">{performanceData.totalCorrect}</span>
                </div>
                <div className="mpd-stats-row flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">Score</span>
                  <span className="font-bold text-purple-500">{performanceData.totalScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="mpd-chart-section mb-6">
            <h3 className="mpd-section-title text-lg font-bold mb-3">Weekly Progress</h3>
            <div className="mpd-chart bg-slate-800 p-4 rounded-xl h-64 flex items-center justify-center">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <path d="M50,150 L100,100 L150,120 L200,80 L250,90 L300,60 L350,30" 
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth="3" 
                />
                <path d="M50,150 L100,130 L150,140 L200,110 L250,120 L300,100 L350,90" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="3" 
                />
                <circle cx="50" cy="150" r="4" fill="#ec4899" />
                <circle cx="100" cy="100" r="4" fill="#ec4899" />
                <circle cx="150" cy="120" r="4" fill="#ec4899" />
                <circle cx="200" cy="80" r="4" fill="#ec4899" />
                <circle cx="250" cy="90" r="4" fill="#ec4899" />
                <circle cx="300" cy="60" r="4" fill="#ec4899" />
                <circle cx="350" cy="30" r="4" fill="#ec4899" />
                
                <circle cx="50" cy="150" r="4" fill="#8b5cf6" />
                <circle cx="100" cy="130" r="4" fill="#8b5cf6" />
                <circle cx="150" cy="140" r="4" fill="#8b5cf6" />
                <circle cx="200" cy="110" r="4" fill="#8b5cf6" />
                <circle cx="250" cy="120" r="4" fill="#8b5cf6" />
                <circle cx="300" cy="100" r="4" fill="#8b5cf6" />
                <circle cx="350" cy="90" r="4" fill="#8b5cf6" />
                
                <text x="50" y="180" textAnchor="middle" className="fill-slate-400 text-xs">17</text>
                <text x="100" y="180" textAnchor="middle" className="fill-slate-400 text-xs">18</text>
                <text x="150" y="180" textAnchor="middle" className="fill-slate-400 text-xs">19</text>
                <text x="200" y="180" textAnchor="middle" className="fill-slate-400 text-xs">20</text>
                <text x="250" y="180" textAnchor="middle" className="fill-slate-400 text-xs">21</text>
                <text x="300" y="180" textAnchor="middle" className="fill-slate-400 text-xs">22</text>
                <text x="350" y="180" textAnchor="middle" className="fill-slate-400 text-xs">23</text>
              </svg>
            </div>
            <div className="mpd-chart-legend flex justify-center mt-2">
              <div className="mpd-legend-item flex items-center mr-4">
                <div className="h-3 w-3 rounded-full bg-pink-500 mr-1"></div>
                <span className="text-xs text-slate-300">Score</span>
              </div>
              <div className="mpd-legend-item flex items-center">
                <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
                <span className="text-xs text-slate-300">Games Played</span>
              </div>
            </div>
          </div> */}

                    <div className="mpd-chart-section mb-6">
  <h3 className="mpd-section-title text-lg font-bold mb-3">Monthly Progress</h3>
  <div className="mpd-chart bg-slate-800 p-4 rounded-xl h-64 overflow-hidden">
    <div className="h-full flex items-center justify-center">
      {renderMonthlyProgressChart(getMonthlyWeeksData())}
    </div>
  </div>
  <div className="mpd-chart-legend flex justify-center mt-2">
    <div className="mpd-legend-item flex items-center mr-4">
      <div className="h-3 w-3 rounded-full bg-pink-500 mr-1"></div>
      <span className="text-xs text-slate-300">Score</span>
    </div>
    <div className="mpd-legend-item flex items-center">
      <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
      <span className="text-xs text-slate-300">Games Played</span>
    </div>
  </div>
</div>

{/* // Second chart section (Weekdays Progress) */}
<div className="mpd-chart-section mb-6">
  <h3 className="mpd-section-title text-lg font-bold mb-3">Weekdays Progress</h3>
  <div className="mpd-chart bg-slate-800 p-4 rounded-xl h-64 overflow-hidden">
    <div className="h-full flex items-center justify-center">
      {renderWeekdaysChart(getWeekdaysData())}
    </div>
  </div>
  <div className="mpd-chart-legend flex justify-center mt-2">
    <div className="mpd-legend-item flex items-center mr-4">
      <div className="h-3 w-3 rounded-full bg-pink-500 mr-1"></div>
      <span className="text-xs text-slate-300">Score</span>
    </div>
    <div className="mpd-legend-item flex items-center">
      <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
      <span className="text-xs text-slate-300">Games Played</span>
    </div>
  </div>
</div>

          {/* <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#ec4899" />
            </LineChart>
          </ResponsiveContainer> */}

                      <div className="mpd-stat-row flex justify-between mb-3">
              <div className="mpd-stat-group">
                <div className="mpd-stat-value font-bold text-2xl">{performanceData.totalGames}</div>
                <div className="mpd-stat-label text-xs text-slate-400">Total Games</div>
              </div>
              <div className="mpd-stat-group">
                <div className="mpd-stat-value font-bold text-2xl text-green-500">{performanceData.totalCorrect}</div>
                <div className="mpd-stat-label text-xs text-slate-400">Correct</div>
              </div>
              <div className="mpd-stat-group">
                <div className="mpd-stat-value font-bold text-2xl text-purple-500">{performanceData.totalScore}</div>
                <div className="mpd-stat-label text-xs text-slate-400">Total Score</div>
              </div>
            </div>

                    {performanceData && (
  <div className="mpd-progress-section mb-3">
    <div className="mpd-progress-row mb-3">
      <div className="flex justify-between mb-1">
        <div className="text-sm">Accuracy</div>
        <div className="text-sm font-bold">{Math.min(accuracyRate, 100)}%</div>
      </div>
      <div className="mpd-progress-bg h-2 bg-slate-700 rounded-full">
        <div 
          className="mpd-progress-bar h-full rounded-full bg-green-500" 
          style={{ width: `${Math.min(accuracyRate, 100)}%` }}
        ></div>
      </div>
    </div>

    <div className="mpd-progress-row">
      <div className="flex justify-between mb-1">
        <div className="text-sm">Speed Performance</div>
        <div className="text-sm font-bold">{Math.min(speedRate, 100)}%</div>
      </div>
      <div className="mpd-progress-bg h-2 bg-slate-700 rounded-full">
        <div 
          className="mpd-progress-bar h-full rounded-full bg-blue-500" 
          style={{ width: `${Math.min(speedRate, 100)}%` }}
        ></div>
      </div>
    </div>
  </div>
)}
          {/* <div className="mpd-chart-section mb-6">
          <h3 className="mpd-section-title text-lg font-bold mb-3">Weekly Progress</h3>
          <div className="mpd-chart bg-slate-800 p-4 rounded-xl h-64 flex items-center justify-center">

          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path
              d={
                last7Days
                  .map((d, i) => {
                    const x = 50 + i * 50;
                    const y = 150 - (d.score / 10) * 120; // scale 0-100 to 120px
                    return `${i === 0 ? "M" : "L"}${x},${y}`;
                  })
                  .join(" ")
              }
              fill="none"
              stroke="#ec4899"
              strokeWidth="3"
            />
            <path
              d={
                last7Days
                  .map((d, i) => {
                    const x = 50 + i * 50;
                    const y = 150 - (d.gamesPlayed / 10) * 120; // scale 0-10 to 120px
                    return `${i === 0 ? "M" : "L"}${x},${y}`;
                  })
                  .join(" ")
              }
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
            />

            {last7Days.map((d, i) => {
              const x = 50 + i * 50;
              const y = 150 - (d.score / 10) * 120;
              return <circle key={`s-${i}`} cx={x} cy={y} r="4" fill="#ec4899" />;
            })}

            {last7Days.map((d, i) => {
              const x = 50 + i * 50;
              const y = 150 - (d.gamesPlayed / 10) * 120;
              return <circle key={`g-${i}`} cx={x} cy={y} r="4" fill="#8b5cf6" />;
            })}

            {last7Days.map((d, i) => {
              const x = 50 + i * 50;
              const date = new Date(d.date);
              const day = date.getDate();
              return (
                <text
                  key={`t-${i}`}
                  x={x}
                  y={180}
                  textAnchor="middle"
                  className="fill-slate-400 text-xs"
                >
                  {day}
                </text>
              );
            })}
          </svg>

          </div>
          <div className="mpd-chart-legend flex justify-center mt-2">
              <div className="mpd-legend-item flex items-center mr-4">
                <div className="h-3 w-3 rounded-full bg-pink-500 mr-1"></div>
                <span className="text-xs text-slate-300">Score</span>
              </div>
              <div className="mpd-legend-item flex items-center">
                <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
                <span className="text-xs text-slate-300">Games Played</span>
              </div>
            </div>
          </div> */}





          <div className="mpd-game-types mb-6">
            <h3 className="mpd-section-title text-lg font-bold mb-3">Game Types</h3>
            <div className="mpd-game-types-chart bg-slate-800 p-4 rounded-xl">
              <div className="mpd-game-bar-container mb-4">
                <div className="mpd-game-bar-label flex justify-between text-sm mb-1">
                  <span className="capitalize">Memory</span>
                  <span>{performanceData.totalGames} play</span>
                </div>
                <div className="mpd-game-bar-bg h-6 bg-slate-700 rounded-full">
                  <div className="mpd-game-bar h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
     </div> 

      {activeTab === 'history' && (
        <div className="mpd-history p-4">
          <div className="mpd-history-list">
            {performanceData.history.map((item, index) => (
              <div key={index} className="mpd-history-item bg-slate-800 p-4 rounded-xl mb-4">
                <div className="mpd-history-header flex justify-between items-center mb-2">
                  <div className="mpd-game-info">
                    <span className="mpd-game-type capitalize font-bold">{item.gameType}</span>
                    <span className="mpd-game-difficulty text-xs text-slate-400 ml-2 capitalize">({item.difficulty})</span>
                  </div>
                  <div className="mpd-game-date text-xs text-slate-400">
                    {item.date} • {formatTime(item.timestamp)}
                  </div>
                </div>
                <div className="mpd-history-details grid grid-cols-3 gap-2">
                  <div className="mpd-history-stat p-2 bg-slate-700 rounded-lg text-center">
                    <div className="mpd-stat-value font-bold text-green-400">{item.correct ? "✓" : "✗"}</div>
                    <div className="mpd-stat-label text-xs text-slate-400">Result</div>
                  </div>
                  <div className="mpd-history-stat p-2 bg-slate-700 rounded-lg text-center">
                    <div className="mpd-stat-value font-bold">{item.score}</div>
                    <div className="mpd-stat-label text-xs text-slate-400">Score</div>
                  </div>
                  <div className="mpd-history-stat p-2 bg-slate-700 rounded-lg text-center">
                    <div className="mpd-stat-value font-bold">{item.speed}</div>
                    <div className="mpd-stat-label text-xs text-slate-400">Speed</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="mpd-stats p-4">
          {/* <div className="mpd-stats-card bg-slate-800 p-4 rounded-xl mb-6">
            <h3 className="mpd-section-title text-lg font-bold mb-3">Game Stats</h3>
            
            <div className="mpd-stat-row flex justify-between mb-3">
              <div className="mpd-stat-group">
                <div className="mpd-stat-value font-bold text-2xl">{performanceData.totalGames}</div>
                <div className="mpd-stat-label text-xs text-slate-400">Total Games</div>
              </div>
              <div className="mpd-stat-group">
                <div className="mpd-stat-value font-bold text-2xl text-green-500">{performanceData.totalCorrect}</div>
                <div className="mpd-stat-label text-xs text-slate-400">Correct</div>
              </div>
              <div className="mpd-stat-group">
                <div className="mpd-stat-value font-bold text-2xl text-purple-500">{performanceData.totalScore}</div>
                <div className="mpd-stat-label text-xs text-slate-400">Total Score</div>
              </div>
            </div>
                      {performanceData && (
              <div className="mpd-progress-section mb-3">
                <div className="mpd-progress-row mb-3">
                  <div className="flex justify-between mb-1">
                    <div className="text-sm">Accuracy</div>
                    <div className="text-sm font-bold">{accuracyRate}%</div>
                  </div>
                  <div className="mpd-progress-bg h-2 bg-slate-700 rounded-full">
                    <div 
                      className="mpd-progress-bar h-full rounded-full bg-green-500" 
                      style={{ width: `${accuracyRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mpd-progress-row">
                  <div className="flex justify-between mb-1">
                    <div className="text-sm">Speed Performance</div>
                    <div className="text-sm font-bold">{speedRate}%</div>
                  </div>
                  <div className="mpd-progress-bg h-2 bg-slate-700 rounded-full">
                    <div 
                      className="mpd-progress-bar h-full rounded-full bg-blue-500" 
                      style={{ width: `${speedRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

          </div> */}


          {/* <div className="mpd-game-distribution mb-6">
            <h3 className="mpd-section-title text-lg font-bold mb-3">Game Distribution</h3>
            <div className="mpd-distribution-chart bg-slate-800 p-4 rounded-xl h-64 flex items-center justify-center">
              <div className="mpd-bar-chart flex items-end h-48 w-full justify-center">
                {gameDistribution.length > 0 ? (
                  gameDistribution.map(([type, data], index) => {
                    const height = (data.plays / performanceData.totalGames) * 100;
                    return (
                      <div key={index} className="mpd-bar-column mx-4 flex flex-col items-center">
                        <div
                          className="mpd-bar w-10 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg"
                          style={{ height: `${(height / 100) * 192}px` }} // 192px = h-48
                        ></div>
                        <div className="mpd-bar-label mt-2 text-xs text-slate-400 capitalize">{type}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 text-sm">No data available</div>
                )}
              </div>
            </div>
          </div> 0\10-------09*/}


          <div className="mpd-game-types mb-6">
  <h3 className="mpd-section-title text-lg font-bold mb-3">Game Distribution</h3>
  <div className="mpd-game-types-chart bg-slate-800 p-4 rounded-xl">
    {getGameDistributionData().map((game, index) => {
      const colors = [
        'from-purple-500 to-pink-500',
        'from-blue-500 to-purple-500', 
        'from-green-500 to-blue-500',
        'from-yellow-500 to-orange-500',
        'from-red-500 to-pink-500',
        'from-indigo-500 to-purple-500'
      ];
      
      return (
        <div key={index} className="mpd-game-bar-container mb-4">
          <div className="mpd-game-bar-label flex justify-between text-sm mb-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index]} mr-2`}></div>
              <span className="capitalize font-medium">{game.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-slate-400">{game.plays} plays</span>
              <span className="font-bold">{game.percentage}%</span>
            </div>
          </div>
          <div className="mpd-game-bar-bg h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`mpd-game-bar h-full rounded-full bg-gradient-to-r ${colors[index]} transition-all duration-500 ease-out`}
              style={{ width: `${game.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Score: {game.score}</span>
            <span>Rank #{index + 1}</span>
          </div>
        </div>
      );
    })}
    
    {getGameDistributionData().length === 0 && (
      <div className="text-center text-slate-400 py-8">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>No games played yet</p>
        <p className="text-xs mt-1">Start playing to see your game distribution</p>
      </div>
    )}
  </div>
</div>







          {/* <div className="mpd-game-distribution mb-6">
            <h3 className="mpd-section-title text-lg font-bold mb-3">Game Distribution</h3>
            <div className="mpd-distribution-chart bg-slate-800 p-4 rounded-xl h-64 flex items-center justify-center">
              <div className="mpd-bar-chart flex items-end h-48 w-full justify-center">
                <div className="mpd-bar-column mx-4 flex flex-col items-center">
                  <div className="mpd-bar h-full w-16 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg"></div>
                  <div className="mpd-bar-label mt-2 text-xs text-slate-400 capitalize">Memory</div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      )}
 </div>
<div className="mpd-footer bg-slate-800 p-4 fixed bottom-0 w-full flex justify-around border-t border-slate-700 lg:static lg:bg-transparent lg:border-none lg:justify-center lg:gap-12">
          <button className="mpd-nav-btn flex flex-col items-center" onClick={() => setActiveTab('overview')} >
          <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1 text-purple-500 font-bold">Home</span>
        </button>
        <button className="mpd-nav-btn flex flex-col items-center" onClick={() => navigate('/play')}>
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs mt-1 text-slate-400">Play</span>
        </button>
                        <button className="mpd-nav-btn flex flex-col items-center" onClick={() => navigate('/xtra_creation')}>
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs mt-1 text-slate-400"> Play & Learn</span>
        </button>

        <button className="mpd-nav-btn flex flex-col items-center"           onClick={() => navigate('/test')}>
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs mt-1 text-slate-400">Test</span>
        </button>
        <button className="mpd-nav-btn flex flex-col items-center" onClick={() => navigate('/setting')}>
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs mt-1 text-slate-400">Settings</span>
        </button>
      </div>

      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6948409315047214"
     crossorigin="anonymous"></script>
         <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6948409315047214"
      data-ad-slot="f08c47fec0942fa0"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>

    </div>
  );
};

export default MobilePerformanceDashboard;