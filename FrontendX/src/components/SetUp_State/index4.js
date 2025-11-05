import React, { useState, useEffect } from 'react';
import "../../styles/SetUp_State/index2.css"; // Ensure this path is correct
import axios from 'axios'; // Make sure axios is installed
import { useNavigate } from 'react-router-dom';
import Netflix from "../../components/home/netflix";
import { ThreeDot } from 'react-loading-indicators';

const AvecusApp = () => {
  const navigate = useNavigate();
  // App states (unchanged)
  const [appState, setAppState] = useState('setup');
  const [gameType, setGameType] = useState('subtraction');
  const [difficulty, setDifficulty] = useState('single');
  const [firstDigit, setFirstDigit] = useState(1);
  const [secondDigit, setSecondDigit] = useState(1);
  const [speed, setSpeed] = useState(20);
  const [count, setCount] = useState(10);
  
  // Game data (unchanged)
  const [numbers, setNumbers] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingNumbers, setShowingNumbers] = useState(false);
  const [result, setResult] = useState({ correct: false, actualAnswer: '', score: 0 });
  const [targetNumber, setTargetNumber] = useState(null);
  const [missingIndices, setMissingIndices] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [comparisonPairs, setComparisonPairs] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionAnswers, setQuestionAnswers] = useState([]);
    const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState('');
    const [questionTimer, setQuestionTimer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    // 1. ADD ADDITION GAME STATE VARIABLES (add these with your other useState)
const [additionTimer, setAdditionTimer] = useState(null);
const [additionTimeRemaining, setAdditionTimeRemaining] = useState(0);
const [showAdditionAnswer, setShowAdditionAnswer] = useState(false);
const [additionNumbers, setAdditionNumbers] = useState([]);

const [additionCurrentIndex, setAdditionCurrentIndex] = useState(0);
const [additionShowingNumbers, setAdditionShowingNumbers] = useState(true);
const [additionIndividualTimer, setAdditionIndividualTimer] = useState(null);

const [beepInterval, setBeepInterval] = useState(null);

const [totalGameTime, setTotalGameTime] = useState(0); // Total time for entire game
const [gameStartTime, setGameStartTime] = useState(null); // When game started
const [totalGameTimer, setTotalGameTimer] = useState(null); // Global game timer



  // Auth state
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Performance tracking
  const [performanceData, setPerformanceData] = useState({
    totalGames: 0,
    totalCorrect: 0,
    totalScore: 0,
    gameTypes: {},
    dailyStats: {},
    history: []
  });

  const [loading, setLoading] = useState(true); // Add loading state
  const [showImage, setShowImage] = useState(false);

// Always use a safe, positive duration for timers (ms)
const getQuestionMs = () => {
  const s = Number(speed);
  const safeSeconds = !Number.isFinite(s) || s <= 0 ? 1 : s; // default 1s if invalid/0
  return Math.max(100, Math.round(safeSeconds * 1000));
};

// useEffect(() => {
//   return () => {
//     if (questionTimer) clearInterval(questionTimer);
//     if (additionTimer) clearInterval(additionTimer);
//     if (beepInterval) clearInterval(beepInterval);
//   };
// }, [questionTimer, additionTimer, beepInterval]);

// 9. Additional cleanup in useEffect
useEffect(() => {
  return () => {
    // Cleanup all timers on component unmount
    if (questionTimer) clearInterval(questionTimer);
    if (additionTimer) clearInterval(additionTimer);
    if (totalGameTimer) clearInterval(totalGameTimer);
    if (beepInterval) clearInterval(beepInterval);
  };
  }, [questionTimer, additionTimer, totalGameTimer, beepInterval]);

const additionalCSS = `
/* Fix number pad z-index and interaction issues */
.number-pad {
  position: relative !important;
  z-index: 1000 !important;
  pointer-events: auto !important;
  isolation: isolate; /* Creates new stacking context */
}

.number-btn {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 1001 !important;
  user-select: none !important;
  touch-action: manipulation !important; /* Better mobile touch handling */
}

/* Ensure parent containers don't block events */
.math-question-display {
  position: relative !important;
}

.answer-input-section {
  position: relative !important;
  z-index: 999 !important;
}

/* Fix any overlapping issues */
.avc-game-container {
  position: relative !important;
  overflow: visible !important;
}

/* Remove any conflicting pointer-events rules */
.overlapping-class {
  pointer-events: none !important;
}

/* Ensure buttons are always clickable */
.number-pad * {
  pointer-events: auto !important;
}

/* Fix button active states */
.number-btn:active {
  transform: scale(0.95) !important;
  transition: transform 0.1s ease !important;
}

/* Mobile touch improvements */
@media (max-width: 768px) {
  .number-btn {
    min-height: 50px !important;
    min-width: 50px !important;
    font-size: 18px !important;
  }
}
/* Background watermark */
.avc-page-background::before,
.avc-game-container::before,
.avc-result-screen-container::before {
  content: "BRAIN DEVELOPMENT ACADEMY";
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: clamp(2rem, 8vw, 6rem);
  font-weight: 100;
  color: rgba(0, 0, 0, 0.03);
  z-index: -1;
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-family: 'Arial', sans-serif;
}

.dark-theme .avc-page-background::before,
.dark-theme .avc-game-container::before,
.dark-theme .avc-result-screen-container::before {
  color: rgba(255, 255, 255, 0.03);

  /* Addition Mode Sequential Display */
.addition-sequential-display {
  text-align: center;
  padding: 20px;
}

.addition-number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 10px;
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.addition-number-cell {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.addition-number-cell.current-number {
  background: #4CAF50;
  color: white;
  border-color: #45a049;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  animation: pulse 1s infinite;
}

.addition-number-cell.shown-number {
  background: #e8f5e8;
  color: #2e7d32;
  border-color: #81c784;
}

.addition-number-cell.hidden-number {
  background: #f5f5f5;
  color: #999;
  border-color: #ddd;
}

.big-current-number {
  font-size: 4rem;
  font-weight: bold;
  color: #4CAF50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: numberPop 0.5s ease-out;
  margin: 20px 0;
}

.addition-progress-info {
  margin-top: 30px;
}

.addition-counter {
  font-size: 1.2rem;
  color: #666;
  margin: 10px 0;
}

.addition-timer-text {
  font-size: 1rem;
  color: #888;
}

.addition-numbers-recap {
  font-size: 1.5rem;
  margin: 20px 0;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 8px;
  border: 2px solid #e3f2fd;
}

@keyframes pulse {
  0% { transform: scale(1.1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1.1); }
}

@keyframes numberPop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
`;

  // Add beep sound function
// const playBeep = () => {
//   try {
//     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//     const oscillator = audioContext.createOscillator();
//     const gainNode = audioContext.createGain();
    
//     oscillator.connect(gainNode);
//     gainNode.connect(audioContext.destination);
    
//     oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
//     gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
//     gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
//     oscillator.start(audioContext.currentTime);
//     oscillator.stop(audioContext.currentTime + 0.5);
//   } catch (error) {
//     console.log('Beep sound not supported');
//   }
// };   10-09

// Enhanced beep sound function with different types
const playBeep = (type = 'normal') => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different beep types
    switch(type) {
      case 'normal':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
        
      case 'warning':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
        
      case 'urgent':
        // Double beep for urgency
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
        // Second beep
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
          gainNode2.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.1);
        }, 150);
        break;
        
      case 'final':
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        break;
    }
  } catch (error) {
    console.log('Beep sound not supported');
  }
};


const startAdditionSequentialDisplay = (nums, timePerNumber) => {
  let currentIdx = 0;
  setAdditionCurrentIndex(0);
  
  const interval = setInterval(() => {
    if (currentIdx < nums.length - 1) {
      currentIdx++;
      setAdditionCurrentIndex(currentIdx);
      
      // Play beep sound when showing new number
      playBeep();
    } else {
      // All numbers shown, now show input
      clearInterval(interval);
      setAdditionShowingNumbers(false);
      setShowAdditionAnswer(true);
    }
  }, timePerNumber);
};

  // API configuration
  const API_URL = 'http://localhost:5000/api';
  
  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem('token');
        const deviceId = localStorage.getItem('deviceId');

    if (token) {
      console.log("Found token, verifying...");
      axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `${token}`,
      'X-Device-Id': deviceId }
      })
      .then(response => {
        console.log("Token verified successfully", response.data);
        setUserId(response.data.userId);
        fetchUserData(response.data.userId);
      })
      .catch(err => {
        console.error("Authentication error:", err);
        localStorage.removeItem('token');
        setIsLoading(false);
        loadLocalData();
      });
    } else {
      console.log("No token found, loading local data");
      loadLocalData();
      setIsLoading(false);
    }
  }, []);
  
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
  
  const fetchUserData = (uid) => {
    const token = localStorage.getItem('token');
  const deviceId = localStorage.getItem('deviceId');

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
    localStorage.setItem('avecusPerformance', JSON.stringify(performanceData));
    console.log("Saved to localStorage:", performanceData);
  const deviceId = localStorage.getItem('deviceId');
    if (userId) {
      const timerId = setTimeout(() => {
        console.log("Saving to server for user:", userId);
        axios.post(`${API_URL}/performance/${userId}`, performanceData, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem('token') }`,
              'X-Device-Id': deviceId
           
          }
        })
        .then(response => {
          console.log("Successfully saved to server:", response.data);
        })
        .catch(err => {
          console.error("Error saving data to server:", err);
          setError("Failed to save your progress to the server.");
        });
      }, 2000);
      
      return () => clearTimeout(timerId);
    }
  }, [performanceData, userId, isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedData = localStorage.getItem('avecusPerformance');
      console.log("Data persistence check:", savedData ? "Data exists in localStorage" : "No data in localStorage");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Updated gameModes with the three new math operation games at the top
  const gameModes = [
    { value: 'addition', label: 'Addition ⭐' },
    { value: 'subtraction', label: 'Subtraction ⭐' },
    { value: 'multiplication', label: 'Multiplication ⭐' },
    { value: 'division', label: 'Division ⭐' },
    { value: 'mixedMath', label: 'Addition And Subtraction ⭐' },

    { value: 'memory', label: 'Memory Mode' },

     // Add the new total operation modes
    { value: 'totalAddition', label: 'Total Addition' },
    { value: 'totalSubtraction', label: 'Total Subtraction' },
    { value: 'totalMultiplication', label: 'Total Multiplication' },
    { value: 'totalDivision', label: 'Total Division' },
    { value: 'counting', label: 'Counting Mode' },

    { value: 'counting', label: 'Counting Mode' },
    { value: 'pattern', label: 'Pattern Recognition' },
    { value: 'reverse', label: 'Reverse Counting' },
    { value: 'missing', label: 'Missing Number' },
    { value: 'oddeven', label: 'Odd & Even Recognition' },
    { value: 'multiples', label: 'Multiples & Factors' },
    { value: 'comparison', label: 'Number Comparison' },
    { value: 'speed', label: 'Speed Counting' },
    { value: 'symbol', label: 'Number-Symbol Association' }
  ];
  
  const getCurrentDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  
  // const generateNumbers = () => {
  //   const newNumbers = [];
  //   for (let i = 0; i < count; i++) {
  //     if (difficulty === 'single') {
  //       newNumbers.push(Math.floor(Math.random() * 10));
  //     } else if (difficulty === 'double') {
  //       newNumbers.push(Math.floor(Math.random() * 90 + 10));
  //     } else {
  //       newNumbers.push(Math.floor(Math.random() * 900 + 100));
  //     }
  //   }
  //   return newNumbers;
  // };
  
  const generateNumbers = () => {
  const newNumbers = [];
  const digits = firstDigit || 1;
  
  for (let i = 0; i < count; i++) {
    if (digits === 1) {
      newNumbers.push(Math.floor(Math.random() * 9) + 1);
    } else if (digits === 2) {
      newNumbers.push(Math.floor(Math.random() * 90) + 10);
    } else if (digits === 3) {
      newNumbers.push(Math.floor(Math.random() * 900) + 100);
    } else if (digits === 4) {
      newNumbers.push(Math.floor(Math.random() * 9000) + 1000);
    } else if (digits === 5) {
      newNumbers.push(Math.floor(Math.random() * 90000) + 10000);
    } else if (digits === 6) {
      newNumbers.push(Math.floor(Math.random() * 900000) + 100000);
    }
  }
  return newNumbers;
};

  const generateSymbols = () => {
    const symbols = ['★', '♦', '♣', '♠', '♥', '▲', '●', '■', '◆', '○'];
    return Array(count).fill().map(() => symbols[Math.floor(Math.random() * symbols.length)]);
  };
  
  const generateComparisonPairs = () => {
    const pairs = [];
    for (let i = 0; i < count; i++) {
      const num1 = Math.floor(Math.random() * 50) + 1;
      const num2 = Math.floor(Math.random() * 50) + 1;
      pairs.push([num1, num2]);
    }
    return pairs;
  };
  
  // Generate number pairs for subtraction, ensuring the first number is larger
// REPLACE your generateSubtractionPairs, generateMultiplicationPairs, and generateDivisionPairs functions:

// Generate number pairs for subtraction, ensuring the first number is larger
// const generateSubtractionPairs = () => {
//   const pairs = [];
//   // Use 'count' parameter to generate the correct number of questions
//   for (let i = 0; i < count; i++) {
//     let num1, num2;
//     if (difficulty === 'single') {
//       num1 = Math.floor(Math.random() * 9) + 5;  // Start with at least 5
//       num2 = Math.floor(Math.random() * Math.min(num1, 5)) + 1;
//     } else if (difficulty === 'double') {
//       num1 = Math.floor(Math.random() * 50) + 50; // Start with at least 50
//       num2 = Math.floor(Math.random() * Math.min(num1, 50)) + 1;
//     } else {
//       num1 = Math.floor(Math.random() * 500) + 500; // Start with at least 500
//       num2 = Math.floor(Math.random() * Math.min(num1, 500)) + 1;
//     }
//     pairs.push([num1, num2]);
//   }
//   console.log(`Generated ${pairs.length} subtraction pairs:`, pairs); // Debug log
//   return pairs;
// }; 10-09

// Generate number pairs for multiplication
// const generateMultiplicationPairs = () => {
//   const pairs = [];
//   // Use 'count' parameter to generate the correct number of questions
//   for (let i = 0; i < count; i++) {
//     let num1, num2;
//     if (difficulty === 'single') {
//       num1 = Math.floor(Math.random() * 9) + 1;
//       num2 = Math.floor(Math.random() * 9) + 1;
//     } else if (difficulty === 'double') {
//       num1 = Math.floor(Math.random() * 12) + 1;
//       num2 = Math.floor(Math.random() * 12) + 1;
//     } else {
//       num1 = Math.floor(Math.random() * 20) + 1;
//       num2 = Math.floor(Math.random() * 20) + 1;
//     }
//     pairs.push([num1, num2]);
//   }
//   console.log(`Generated ${pairs.length} multiplication pairs:`, pairs); // Debug log
//   return pairs;
// };



// Generate number pairs for division, ensuring clean division
// const generateDivisionPairs = () => {
//   const pairs = [];
//   // Use 'count' parameter to generate the correct number of questions
//   for (let i = 0; i < count; i++) {
//     let num1, num2;
//     if (difficulty === 'single') {
//       num2 = Math.floor(Math.random() * 9) + 1;
//       const multiplier = Math.floor(Math.random() * 9) + 1;
//       num1 = num2 * multiplier;
//     } else if (difficulty === 'double') {
//       num2 = Math.floor(Math.random() * 12) + 1;
//       const multiplier = Math.floor(Math.random() * 12) + 1;
//       num1 = num2 * multiplier;
//     } else {
//       num2 = Math.floor(Math.random() * 20) + 1;
//       const multiplier = Math.floor(Math.random() * 20) + 1;
//       num1 = num2 * multiplier;
//     }
//     pairs.push([num1, num2]);
//   }
//   console.log(`Generated ${pairs.length} division pairs:`, pairs); // Debug log
//   return pairs;
// };
  
//   const generateMultiplicationPairs = () => {
//   const pairs = [];
//   for (let i = 0; i < count; i++) {
//     let num1, num2;
//     switch(difficulty) {
//       case 'single':
//         num1 = Math.floor(Math.random() * 9) + 1;
//         num2 = Math.floor(Math.random() * 9) + 1;
//         break;
//       case 'double':
//         num1 = Math.floor(Math.random() * 12) + 1;
//         num2 = Math.floor(Math.random() * 12) + 1;
//         break;
//       case 'triple':
//         num1 = Math.floor(Math.random() * 20) + 1;
//         num2 = Math.floor(Math.random() * 20) + 1;
//         break;
//       case 'singleToDouble':
//         // Single digit numbers that multiply to double digit results
//         num1 = Math.floor(Math.random() * 9) + 2; // 2-10
//         num2 = Math.floor(Math.random() * 9) + 2; // 2-10
//         // Ensure result is double digit
//         while ((num1 * num2) < 10 || (num1 * num2) > 99) {
//           num1 = Math.floor(Math.random() * 9) + 2;
//           num2 = Math.floor(Math.random() * 9) + 2;
//         }
//         break;
//       case 'doubleToSingle':
//         // Double digit first number, single digit second, result is single digit
//         num2 = Math.floor(Math.random() * 9) + 1; // 1-9
//         num1 = Math.floor(Math.random() * 90) + 10; // 10-99
//         break;
//       default:
//         num1 = Math.floor(Math.random() * 9) + 1;
//         num2 = Math.floor(Math.random() * 9) + 1;
//     }
//     pairs.push([num1, num2]);
//   }
//   console.log(`Generated ${pairs.length} multiplication pairs:`, pairs);
//   return pairs;
// };10-09


// const generateDivisionPairs = () => {
//   const pairs = [];
//   for (let i = 0; i < count; i++) {
//     let num1, num2;
//     switch(difficulty) {
//       case 'single':
//         num2 = Math.floor(Math.random() * 9) + 1;
//         const multiplier1 = Math.floor(Math.random() * 9) + 1;
//         num1 = num2 * multiplier1;
//         break;
//       case 'double':
//         num2 = Math.floor(Math.random() * 12) + 1;
//         const multiplier2 = Math.floor(Math.random() * 12) + 1;
//         num1 = num2 * multiplier2;
//         break;
//       case 'triple':
//         num2 = Math.floor(Math.random() * 20) + 1;
//         const multiplier3 = Math.floor(Math.random() * 20) + 1;
//         num1 = num2 * multiplier3;
//         break;
//       case 'singleToDouble':
//         // Single digit division resulting in double digit answer
//         num2 = Math.floor(Math.random() * 9) + 1; // 1-9
//         const multiplier4 = Math.floor(Math.random() * 90) + 10; // 10-99
//         num1 = num2 * multiplier4;
//         break;
//       case 'doubleToSingle':
//         // Double digit divided by double digit = single digit
//         const result = Math.floor(Math.random() * 9) + 1; // 1-9
//         num2 = Math.floor(Math.random() * 90) + 10; // 10-99
//         num1 = num2 * result;
//         break;
//       default:
//         num2 = Math.floor(Math.random() * 9) + 1;
//         const multiplier5 = Math.floor(Math.random() * 9) + 1;
//         num1 = num2 * multiplier5;
//     }
//     pairs.push([num1, num2]);
//   }
//   console.log(`Generated ${pairs.length} division pairs:`, pairs);
//   return pairs;
// };10-09




const startGlobalGameTimer = (totalTimeMs) => {
  console.log(`Starting global timer: ${totalTimeMs}ms total for ${count} questions`);
  
  // Clear any existing timers
  if (totalGameTimer) {
    clearInterval(totalGameTimer);
  }
  if (beepInterval) {
    clearInterval(beepInterval);
  }
  
  // Calculate beep intervals based on total game time
  const beepIntervalTime = Math.max(500, Math.floor(totalTimeMs / 20)); // Beep every 5% of total time
  
  // Start beeping
  const beepTimer = setInterval(() => {
    playBeep('normal');
  }, beepIntervalTime);
  setBeepInterval(beepTimer);
  
  // Main countdown timer
  const gameTimer = setInterval(() => {
    setTimeRemaining(prev => {
      const newTime = prev - 100;
      const percentRemaining = newTime / totalTimeMs;
      
      // Beep patterns based on remaining time
      if (percentRemaining <= 0.3 && percentRemaining > 0.2) {
        if (newTime % Math.max(400, Math.floor(totalTimeMs * 0.08)) < 100) {
          clearInterval(beepTimer);
          playBeep('warning');
        }
      } else if (percentRemaining <= 0.2 && percentRemaining > 0.1) {
        if (newTime % Math.max(300, Math.floor(totalTimeMs * 0.05)) < 100) {
          playBeep('urgent');
        }
      } else if (percentRemaining <= 0.1 && newTime > 0) {
        if (newTime % Math.max(150, Math.floor(totalTimeMs * 0.02)) < 100) {
          playBeep('urgent');
        }
      }
      
      // TIME'S UP - Force end game
      if (newTime <= 0) {
        console.log('TOTAL GAME TIME UP - Force ending game');
        clearInterval(gameTimer);
        clearInterval(beepTimer);
        setTotalGameTimer(null);
        setBeepInterval(null);
        playBeep('final');
        
        // Force submit with all current answers
        forceEndGame();
        return 0;
      }
      
      return newTime;
    });
  }, 100);
  
  setTotalGameTimer(gameTimer);
};

// 4. NEW FUNCTION: Force end game when total time is up
const forceEndGame = () => {
  console.log('Force ending game - collecting all answers');
  
  // Add current answer to the list
  const finalAnswers = [...questionAnswers];
  if (currentQuestionAnswer.trim()) {
    finalAnswers[currentQuestionIndex] = currentQuestionAnswer.trim();
  }
  
  // Fill remaining answers with empty strings
  while (finalAnswers.length < comparisonPairs.length) {
    finalAnswers.push('');
  }
  
  console.log('Final answers submitted:', finalAnswers);
  checkAllAnswers(finalAnswers);
};


const generateSubtractionPairs = () => {
  const pairs = [];
  const digit1 = firstDigit || 1;
  const digit2 = secondDigit || 1;
  
  for (let i = 0; i < count; i++) {
    let num1, num2;
    
    // Generate first number based on firstDigit
    if (digit1 === 1) num1 = Math.floor(Math.random() * 9) + 1;
    else if (digit1 === 2) num1 = Math.floor(Math.random() * 90) + 10;
    else if (digit1 === 3) num1 = Math.floor(Math.random() * 900) + 100;
    else if (digit1 === 4) num1 = Math.floor(Math.random() * 9000) + 1000;
    else if (digit1 === 5) num1 = Math.floor(Math.random() * 90000) + 10000;
    else if (digit1 === 6) num1 = Math.floor(Math.random() * 900000) + 100000;
    
    // Generate second number based on secondDigit
    if (digit2 === 1) num2 = Math.floor(Math.random() * 9) + 1;
    else if (digit2 === 2) num2 = Math.floor(Math.random() * 90) + 10;
    else if (digit2 === 3) num2 = Math.floor(Math.random() * 900) + 100;
    else if (digit2 === 4) num2 = Math.floor(Math.random() * 9000) + 1000;
    else if (digit2 === 5) num2 = Math.floor(Math.random() * 90000) + 10000;
    else if (digit2 === 6) num2 = Math.floor(Math.random() * 900000) + 100000;
    
    // Ensure positive result
    if (num2 > num1) [num1, num2] = [num2, num1];
    
    pairs.push([num1, num2]);
  }
  return pairs;
};

const generateMultiplicationPairs = () => {
  const pairs = [];
  const digit1 = firstDigit || 1;
  const digit2 = secondDigit || 1;
  
  for (let i = 0; i < count; i++) {
    let num1, num2;
    
    // Generate first number based on firstDigit
    if (digit1 === 1) num1 = Math.floor(Math.random() * 9) + 1;
    else if (digit1 === 2) num1 = Math.floor(Math.random() * 90) + 10;
    else if (digit1 === 3) num1 = Math.floor(Math.random() * 900) + 100;
    else if (digit1 === 4) num1 = Math.floor(Math.random() * 9000) + 1000;
    else if (digit1 === 5) num1 = Math.floor(Math.random() * 90000) + 10000;
    else if (digit1 === 6) num1 = Math.floor(Math.random() * 900000) + 100000;
    
    // Generate second number based on secondDigit
    if (digit2 === 1) num2 = Math.floor(Math.random() * 9) + 1;
    else if (digit2 === 2) num2 = Math.floor(Math.random() * 90) + 10;
    else if (digit2 === 3) num2 = Math.floor(Math.random() * 900) + 100;
    else if (digit2 === 4) num2 = Math.floor(Math.random() * 9000) + 1000;
    else if (digit2 === 5) num2 = Math.floor(Math.random() * 90000) + 10000;
    else if (digit2 === 6) num2 = Math.floor(Math.random() * 900000) + 100000;
    
    pairs.push([num1, num2]);
  }
  return pairs;
};

const generateDivisionPairs = () => {
  const pairs = [];
  const digit1 = firstDigit || 1;
  const digit2 = secondDigit || 1;
  
  for (let i = 0; i < count; i++) {
    let num2, multiplier;
    
    // Generate divisor based on secondDigit
    if (digit2 === 1) num2 = Math.floor(Math.random() * 9) + 1;
    else if (digit2 === 2) num2 = Math.floor(Math.random() * 90) + 10;
    else if (digit2 === 3) num2 = Math.floor(Math.random() * 900) + 100;
    else if (digit2 === 4) num2 = Math.floor(Math.random() * 9000) + 1000;
    else if (digit2 === 5) num2 = Math.floor(Math.random() * 90000) + 10000;
    else if (digit2 === 6) num2 = Math.floor(Math.random() * 900000) + 100000;
    
    // Generate multiplier to create dividend of desired digits
    if (digit1 === 1) multiplier = Math.floor(Math.random() * 9) + 1;
    else if (digit1 === 2) multiplier = Math.floor(Math.random() * 90) + 10;
    else if (digit1 === 3) multiplier = Math.floor(Math.random() * 900) + 100;
    else if (digit1 === 4) multiplier = Math.floor(Math.random() * 9000) + 1000;
    else if (digit1 === 5) multiplier = Math.floor(Math.random() * 90000) + 10000;
    else if (digit1 === 6) multiplier = Math.floor(Math.random() * 900000) + 100000;
    
    const num1 = num2 * multiplier;
    pairs.push([num1, num2]);
  }
  return pairs;
};

// 2. ADD this new function after generateDivisionPairs (around line 580)
const generateMixedMathPairs = () => {
  const pairs = [];
  const digit1 = firstDigit || 1;
  const digit2 = secondDigit || 1;
  
  for (let i = 0; i < count; i++) {
    let num1, num2;
    
    // Generate first number based on firstDigit
    if (digit1 === 1) num1 = Math.floor(Math.random() * 9) + 1;
    else if (digit1 === 2) num1 = Math.floor(Math.random() * 90) + 10;
    else if (digit1 === 3) num1 = Math.floor(Math.random() * 900) + 100;
    else if (digit1 === 4) num1 = Math.floor(Math.random() * 9000) + 1000;
    else if (digit1 === 5) num1 = Math.floor(Math.random() * 90000) + 10000;
    else if (digit1 === 6) num1 = Math.floor(Math.random() * 900000) + 100000;
    
    // Generate second number based on secondDigit
    if (digit2 === 1) num2 = Math.floor(Math.random() * 9) + 1;
    else if (digit2 === 2) num2 = Math.floor(Math.random() * 90) + 10;
    else if (digit2 === 3) num2 = Math.floor(Math.random() * 900) + 100;
    else if (digit2 === 4) num2 = Math.floor(Math.random() * 9000) + 1000;
    else if (digit2 === 5) num2 = Math.floor(Math.random() * 90000) + 10000;
    else if (digit2 === 6) num2 = Math.floor(Math.random() * 900000) + 100000;
    
    // Randomly choose addition or subtraction
    const operation = Math.random() < 0.5 ? 'addition' : 'subtraction';
    
    // For subtraction, ensure positive result
    if (operation === 'subtraction' && num2 > num1) {
      [num1, num2] = [num2, num1];
    }
    
    pairs.push([num1, num2, operation]);
  }
  
  console.log(`Generated ${pairs.length} mixed math pairs:`, pairs);
  return pairs;
};



const startGame = () => {
  let generatedNumbers = [];
  let pairs = [];

  switch(gameType) {
    // case 'addition':
    //   // Generate numbers for addition
    //   generatedNumbers = generateNumbers();
    //   setAdditionNumbers(generatedNumbers);

    //   setAdditionTimeRemaining(speed * 1000);
    //   setShowAdditionAnswer(false);
    //   setUserAnswer('');
    //   startAdditionTimer();
    //   setAppState('game');
    //   return; // Important: return here to avoid other logic

//     case 'addition':
//   // Generate numbers for addition
//   generatedNumbers = generateNumbers();
//   setAdditionNumbers(generatedNumbers);
//   setAdditionCurrentIndex(0);
//   setAdditionShowingNumbers(true);
  
//   // Calculate time per number (total time / number count)
//   const timePerNumber = (speed * 1000) / count; // milliseconds per number
//   setAdditionIndividualTimer(timePerNumber);
//                 setAdditionTimeRemaining(speed * 1000);

//   setShowAdditionAnswer(false);
//   setUserAnswer('');
//   setAppState('game');
  
//   // Start showing numbers one by one
//   startAdditionSequentialDisplay(generatedNumbers, timePerNumber);
//   return;
      
// // const startGame = () => {
// //   let generatedNumbers = [];
// //   let pairs = [];

// //   switch(gameType) {
// //     case 'addition':
// //       // Generate numbers for addition
// //       generatedNumbers = generateNumbers();
// //       setAdditionNumbers(generatedNumbers);
// //       setAdditionTimeRemaining(speed * 1000);
// //       setShowAdditionAnswer(false);
// //       setUserAnswer('');
// //       startAdditionTimer();
// //       setAppState('game');
// //       return;
      
//     case 'subtraction':
//       console.log('Starting subtraction game with count:', count);
//       pairs = generateSubtractionPairs();
//       console.log('Generated subtraction pairs:', pairs);

//       setAdditionTimeRemaining(getQuestionMs());

//       setComparisonPairs(pairs);
//       setCurrentQuestionIndex(0);
//       setQuestionAnswers([]);
//       setCurrentQuestionAnswer('');
//       setTimeRemaining(speed * 1000);
//       setAppState('game');
//       // Start timer after a small delay to ensure state is set
//       setTimeout(() => {
//         startQuestionTimer();
//       }, 100);
//       return;
      
//     case 'multiplication':
//       console.log('Starting multiplication game with count:', count);
//       pairs = generateMultiplicationPairs();
//       console.log('Generated multiplication pairs:', pairs);
//       setComparisonPairs(pairs);

//       setAdditionTimeRemaining(getQuestionMs());

//       setCurrentQuestionIndex(0);
//       setQuestionAnswers([]);
//       setCurrentQuestionAnswer('');
//       setTimeRemaining(speed * 1000);
//       setAppState('game');
//       setTimeout(() => {
//         startQuestionTimer();
//       }, 100);
//       return;
      
//     case 'division':
//       console.log('Starting division game with count:', count);
//       pairs = generateDivisionPairs();
//       console.log('Generated division pairs:', pairs);
//       setComparisonPairs(pairs);

//       setAdditionTimeRemaining(getQuestionMs());

//       setCurrentQuestionIndex(0);
//       setQuestionAnswers([]);
//       setCurrentQuestionAnswer('');
//       setTimeRemaining(speed * 1000);
//       setAppState('game');
//       setTimeout(() => {
//         startQuestionTimer();
//       }, 100);
//       return;
       case 'addition':
      generatedNumbers = generateNumbers();
      setAdditionNumbers(generatedNumbers);
      setAdditionCurrentIndex(0);
      setAdditionShowingNumbers(true);
      
      const totalAdditionTime = speed * 1000; // Total time in ms
      setAdditionIndividualTimer(Math.floor(totalAdditionTime / count));
      setAdditionTimeRemaining(totalAdditionTime);
      setShowAdditionAnswer(false);
      setUserAnswer('');
      setAppState('game');
      
      startAdditionTimer();
      startAdditionSequentialDisplay(generatedNumbers, Math.floor(totalAdditionTime / count));
      return;
      
    case 'subtraction':
    case 'multiplication':
    case 'division':
      console.log(`Starting ${gameType}: ${count} questions with ${speed} seconds TOTAL`);
      
      // Generate pairs based on game type
      if (gameType === 'subtraction') pairs = generateSubtractionPairs();
      else if (gameType === 'multiplication') pairs = generateMultiplicationPairs();
      else if (gameType === 'division') pairs = generateDivisionPairs();
      
      setComparisonPairs(pairs);
      setCurrentQuestionIndex(0);
      setQuestionAnswers([]);
      setCurrentQuestionAnswer('');
      
      // Set up TOTAL game time (not per question)
      const totalTime = speed * 1000; // Convert to milliseconds
      setTotalGameTime(totalTime);
      setGameStartTime(Date.now());
      setTimeRemaining(totalTime); // This will countdown the TOTAL time
      
      setAppState('game');
      
      // Start the GLOBAL timer for entire game
      startGlobalGameTimer(totalTime);
      return;

      case 'mixedMath':
      console.log(`Starting mixed math: ${count} questions with ${speed} seconds TOTAL`);
      
      pairs = generateMixedMathPairs();
      setComparisonPairs(pairs);
      setCurrentQuestionIndex(0);
      setQuestionAnswers([]);
      setCurrentQuestionAnswer('');
      
      // Set up TOTAL game time (not per question)
      const totalTimeMixed = speed * 1000; // Convert to milliseconds
      setTotalGameTime(totalTimeMixed);
      setGameStartTime(Date.now());
      setTimeRemaining(totalTimeMixed); // This will countdown the TOTAL time
      
      setAppState('game');
      
      // Start the GLOBAL timer for entire game
      startGlobalGameTimer(totalTimeMixed);
      return;

    // New total operation cases
    case 'totalAddition':
    case 'totalSubtraction':
    case 'totalMultiplication':
    case 'totalDivision':
      // Generate sequence of numbers for the calculation
      if (difficulty === 'single') {
        generatedNumbers = Array(count).fill().map(() => Math.floor(Math.random() * 9) + 1);
      } else if (difficulty === 'double') {
        generatedNumbers = Array(count).fill().map(() => Math.floor(Math.random() * 90) + 10);
      } else {
        generatedNumbers = Array(count).fill().map(() => Math.floor(Math.random() * 900) + 100);
      }
      
      // For totalSubtraction, ensure positive results
      if (gameType === 'totalSubtraction') {
        let firstNumber;
        if (difficulty === 'single') {
          firstNumber = Math.floor(Math.random() * 30) + 20; // 20-50
        } else if (difficulty === 'double') {
          firstNumber = Math.floor(Math.random() * 100) + 100; // 100-200
        } else {
          firstNumber = Math.floor(Math.random() * 500) + 500; // 500-1000
        }
        
        const subsequentNumbers = [];
        let remainingValue = firstNumber * 0.8;
        
        for (let i = 1; i < count; i++) {
          const remainingPositions = count - i;
          const maxForThisPosition = Math.floor(remainingValue / remainingPositions);
          
          let maxValue;
          if (difficulty === 'single') {
            maxValue = Math.min(9, maxForThisPosition);
          } else if (difficulty === 'double') {
            maxValue = Math.min(99, maxForThisPosition);
          } else {
            maxValue = Math.min(999, maxForThisPosition);
          }
          
          maxValue = Math.max(1, maxValue);
          const nextNum = Math.floor(Math.random() * maxValue) + 1;
          subsequentNumbers.push(nextNum);
          remainingValue -= nextNum;
        }
        
        generatedNumbers = [firstNumber, ...subsequentNumbers];
      }
      
      // For totalDivision, ensure clean division
      if (gameType === 'totalDivision') {
        const baseNumber = generatedNumbers[0];
        generatedNumbers = [baseNumber];
        for (let i = 1; i < count; i++) {
          const divisors = [];
          for (let j = 2; j <= Math.min(baseNumber, 12); j++) {
            if (baseNumber % j === 0) divisors.push(j);
          }
          generatedNumbers.push(divisors.length > 0 ? 
            divisors[Math.floor(Math.random() * divisors.length)] : 1);
        }
      }
      break;

    case 'memory':
      generatedNumbers = generateNumbers();
      break;
      
    case 'counting':
      generatedNumbers = generateNumbers();
      setTargetNumber(Math.floor(Math.random() * 10));
      break;
      
    case 'pattern':
      const start = Math.floor(Math.random() * 10);
      const step = Math.floor(Math.random() * 5) + 1;
      generatedNumbers = Array(count).fill().map((_, i) => start + i * step);
      break;
      
    case 'reverse':
      generatedNumbers = generateNumbers();
      break;
      
    case 'missing':
      generatedNumbers = Array(count).fill().map((_, i) => i + 1);
      const missing = [];
      const totalMissing = Math.floor(count / 3);
      while (missing.length < totalMissing) {
        const idx = Math.floor(Math.random() * count);
        if (!missing.includes(idx)) missing.push(idx);
      }
      setMissingIndices(missing);
      break;
      
    case 'oddeven':
      generatedNumbers = Array(count).fill().map(() => Math.floor(Math.random() * 100));
      break;
      
    case 'multiples':
      const baseFactor = Math.floor(Math.random() * 9) + 2;
      generatedNumbers = Array(count).fill().map((_, i) => baseFactor * (i + 1));
      setTargetNumber(baseFactor);
      break;
      
    case 'comparison':
      setComparisonPairs(generateComparisonPairs());
      break;
      
    case 'speed':
      const start2 = Math.floor(Math.random() * 50) + 1;
      generatedNumbers = Array(count).fill().map((_, i) => start2 + i);
      break;
      
    case 'symbol':
      generatedNumbers = generateNumbers().slice(0, 5);
      setSymbols(generateSymbols().slice(0, 5));
      break;
      
    default:
      generatedNumbers = generateNumbers();
  }
  
  setNumbers(generatedNumbers);
  setCurrentIndex(0);
  setShowingNumbers(true);
  setAppState('game');
  
  // Show numbers sequentially for non-math operations
  showNumbersSequentially(generatedNumbers);
};




// const startAdditionTimer = () => {
//   const timer = setInterval(() => {
//     setAdditionTimeRemaining(prev => {
//       if (prev <= 100) {
//         clearInterval(timer);
//         setShowAdditionAnswer(true);
//         return 0;
//       }
//       return prev - 100;
//     });
//   }, 100);
//   setAdditionTimer(timer);
// };

// 4. ADD ADDITION ANSWER CHECK
// const checkAdditionAnswer = () => {
//   const correctSum = additionNumbers.reduce((sum, num) => sum + num, 0);
//   const correct = parseInt(userAnswer) === correctSum;
//   const  score = correct ? 2 : -1;
  
//   setResult({ 
//     correct, 
//     actualAnswer: correctSum.toString(), 
//     score 
//   });
  
//   updatePerformanceData(correct, score);
//   setAppState('result');
// };

//   const startAdditionTimer = () => {
//   const timer = setInterval(() => {
//     setAdditionTimeRemaining(prev => {
//       // Play beep when 3 seconds remaining
//       if (prev <= 3000 && prev > 2900) {
//         playBeep();
//       }
      
//       if (prev <= 100) {
//         clearInterval(timer);
//         playBeep(); // Beep when time expires
//         setShowAdditionAnswer(true);
//         return 0;
//       }
//       return prev - 100;
//     });
//   }, 100);
//   setAdditionTimer(timer);
// }; 09-10

const startAdditionTimer = () => {
  if (beepInterval) {
    clearInterval(beepInterval);
    setBeepInterval(null);
  }
  
  // Start regular beeping every second for addition
  const beepTimer = setInterval(() => {
    playBeep('normal');
  }, 1000);
  setBeepInterval(beepTimer);
  
  const timer = setInterval(() => {
    setAdditionTimeRemaining(prev => {
      const newTime = prev - 100;
      
      // Different beep patterns for addition timer
      if (newTime <= 3000 && newTime > 2000) {
        // Last 3 seconds - warning beeps
        if (newTime % 1000 < 100) {
          clearInterval(beepTimer); // Stop regular beeping
          playBeep('warning');
        }
      } else if (newTime <= 2000 && newTime > 1000) {
        // Last 2 seconds - faster urgent beeps
        if (newTime % 500 < 100) {
          playBeep('urgent');
        }
      } else if (newTime <= 1000 && newTime > 0) {
        // Last 1 second - very fast urgent beeps
        if (newTime % 250 < 100) {
          playBeep('urgent');
        }
      }
      
      if (newTime <= 100) {
        clearInterval(timer);
        clearInterval(beepTimer);
        setBeepInterval(null);
        playBeep('final'); // Final beep when time expires
        setShowAdditionAnswer(true);
        return 0;
      }
      return newTime;
    });
  }, 100);
  setAdditionTimer(timer);
};

const checkAdditionAnswer = () => {
  const correctSum = additionNumbers.reduce((sum, num) => sum + num, 0);
  const correct = parseInt(userAnswer) === correctSum;
  const score = correct ? 2 : -1; // Changed from 1 : -0.25 to 2 : -1
  
  setResult({ 
    correct, 
    actualAnswer: correctSum.toString(), 
    score 
  });
  
  updatePerformanceData(correct, score);
  setAppState('result');
};

// 5. ADD SHOW ANSWER FUNCTION
const showCorrectAdditionAnswer = () => {
  const correctSum = additionNumbers.reduce((sum, num) => sum + num, 0);
  alert(`Correct Answer: ${correctSum}`);
};

  // 3. ADD NEW TIMER FUNCTIONS
// const startQuestionTimer = () => {
//   console.log(`Starting timer for question ${currentQuestionIndex + 1} of ${comparisonPairs.length}`);
//   console.log(`Timer duration: ${speed * 1000}ms (${speed} seconds)`);
  
//   // Clear any existing timer first
//   if (questionTimer) {
//     clearInterval(questionTimer);
//     setQuestionTimer(null);
//   }
  
//   // Reset time remaining
//   setTimeRemaining(speed * 1000);
  
//   const timer = setInterval(() => {
//     setTimeRemaining(prev => {
//       const newTime = prev - 100;
      
//       if (newTime <= 0) {
//         console.log(`Question ${currentQuestionIndex + 1} timer expired`);
//         clearInterval(timer);
//         setQuestionTimer(null);
//         handleQuestionTimeout();
//         return 0;
//       }
//       return newTime;
//     });
//   }, 100);
  
//   setQuestionTimer(timer);
// };

//   const startQuestionTimer = () => {
//   console.log(`Starting timer for question ${currentQuestionIndex + 1} of ${comparisonPairs.length}`);
//   console.log(`Timer duration: ${speed * 1000}ms (${speed} seconds)`);
  
//   if (questionTimer) {
//     clearInterval(questionTimer);
//     setQuestionTimer(null);
//   }
  
//   setTimeRemaining(speed * 1000);
  
//   const timer = setInterval(() => {
//     setTimeRemaining(prev => {
//       const newTime = prev - 100;
      
//       // Play beep when 3 seconds remaining
//       if (newTime <= 3000 && newTime > 2900) {
//         playBeep();
//       }
      
//       if (newTime <= 0) {
//         console.log(`Question ${currentQuestionIndex + 1} timer expired`);
//         clearInterval(timer);
//         setQuestionTimer(null);
//         playBeep(); // Beep when time expires
//         handleQuestionTimeout();
//         return 0;
//       }
//       return newTime;
//     });
//   }, 100);
  
//   setQuestionTimer(timer);
// }; 10-09

const startQuestionTimer = () => {
  console.log(`Starting timer for question ${currentQuestionIndex + 1} of ${comparisonPairs.length}`);
  console.log(`Timer duration: ${speed * 1000}ms (${speed} seconds)`);
  
  if (questionTimer) {
    clearInterval(questionTimer);
    setQuestionTimer(null);
  }
  
  if (beepInterval) {
    clearInterval(beepInterval);
    setBeepInterval(null);
  }
  
  setTimeRemaining(speed * 1000);
  
  // Start regular beeping every second
  const beepTimer = setInterval(() => {
    playBeep('normal');
  }, 1000);
  setBeepInterval(beepTimer);
  
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      const newTime = prev - 100;
      
      // Different beep patterns based on remaining time
      if (newTime <= 3000 && newTime > 2000) {
        // Last 3 seconds - warning beeps
        if (newTime % 1000 < 100) {
          clearInterval(beepTimer); // Stop regular beeping
          playBeep('warning');
        }
      } else if (newTime <= 2000 && newTime > 1000) {
        // Last 2 seconds - faster urgent beeps
        if (newTime % 500 < 100) {
          playBeep('urgent');
        }
      } else if (newTime <= 1000 && newTime > 0) {
        // Last 1 second - very fast urgent beeps
        if (newTime % 250 < 100) {
          playBeep('urgent');
        }
      }
      
      if (newTime <= 0) {
        console.log(`Question ${currentQuestionIndex + 1} timer expired`);
        clearInterval(timer);
        clearInterval(beepTimer);
        setQuestionTimer(null);
        setBeepInterval(null);
        playBeep('final'); // Final timeout beep
        handleQuestionTimeout();
        return 0;
      }
      return newTime;
    });
  }, 100);
  
  setQuestionTimer(timer);
};

// 2. FIX the handleQuestionTimeout function:
const handleQuestionTimeout = () => {
  console.log(`Question ${currentQuestionIndex + 1} timed out, current answer: "${currentQuestionAnswer}"`);
  // Auto-submit current answer (even if empty) and move to next question
  submitCurrentQuestion();
};



// 4. ADD QUESTION SUBMISSION LOGIC
// const submitCurrentQuestion = () => {
//   console.log(`Submitting answer for question ${currentQuestionIndex + 1}: "${currentQuestionAnswer}"`);
//   console.log(`Total questions: ${comparisonPairs.length}, Current question index: ${currentQuestionIndex}`);
  
//   // Add current answer to the answers array
// const newAnswers = [...questionAnswers, currentQuestionAnswer.trim()];
//   setQuestionAnswers(newAnswers);
  
//   // Clear the current timer
//   if (questionTimer) {
//     clearInterval(questionTimer);
//     setQuestionTimer(null);
//   }

//     // Clear beep interval when submitting
//   if (beepInterval) {
//     clearInterval(beepInterval);
//     setBeepInterval(null);
//   }
  
//   // Check if there are more questions
//   if (currentQuestionIndex < comparisonPairs.length - 1) {
//     console.log(`Moving to next question: ${currentQuestionIndex + 2}`);
    
//     // Move to next question
//     const nextIndex = currentQuestionIndex + 1;
//     setCurrentQuestionIndex(nextIndex);
    
//     // Clear current answer
//     setCurrentQuestionAnswer('');
    
//     // Start timer for next question with a delay to ensure state updates
//     setTimeout(() => {
//       setTimeRemaining(speed * 1000);
//       startQuestionTimer();
//     }, 200);
    
//   } else {
//     // All questions completed
//     console.log('All questions completed! Final answers:', newAnswers);
//     console.log('Moving to results...');
//     checkAllAnswers(newAnswers);
//   }
// };  10-09

const submitCurrentQuestion = () => {
  console.log(`Manual submit for question ${currentQuestionIndex + 1}: "${currentQuestionAnswer}"`);
  
  // Add current answer to answers array
  const newAnswers = [...questionAnswers];
  newAnswers[currentQuestionIndex] = currentQuestionAnswer.trim();
  setQuestionAnswers(newAnswers);
  
  // Check if there are more questions
  if (currentQuestionIndex < comparisonPairs.length - 1) {
    console.log(`Moving to next question: ${currentQuestionIndex + 2}`);
    
    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    
    // Clear current answer for next question
    setCurrentQuestionAnswer('');
    
    // NO per-question timer - the global timer continues running
    
  } else {
    // All questions completed manually
    console.log('All questions completed manually!');
    
    // Clear global timer since game is done
    if (totalGameTimer) {
      clearInterval(totalGameTimer);
      setTotalGameTimer(null);
    }
    if (beepInterval) {
      clearInterval(beepInterval);
      setBeepInterval(null);
    }
    
    checkAllAnswers(newAnswers);
  }
};


// Allow keyboard typing as well (digits + optional leading minus)
const handleKeyboardInput = (e) => {
  const raw = e.target.value;
  // Keep digits and a single leading '-'
  const sanitized = raw.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '');
  setCurrentQuestionAnswer(sanitized);
};


// 5. ADD NUMBER PAD HANDLER
// REPLACE your handleNumberPadInput function:


// 6. MODIFY checkAnswer function - replace math operations section
// const checkAllAnswers = (answers) => {
//   let correctCount = 0;
//   let actualAnswers = [];
  
//   // Ensure we have the right number of answers
//   const expectedCount = comparisonPairs.length;
  
//   switch(gameType) {
//     case 'subtraction':
//       actualAnswers = comparisonPairs.map(([a, b]) => (a - b).toString());
//       correctCount = answers.filter((ans, idx) => 
//         idx < actualAnswers.length && ans === actualAnswers[idx]
//       ).length;
//       break;
      
//     case 'multiplication':
//       actualAnswers = comparisonPairs.map(([a, b]) => (a * b).toString());
//       correctCount = answers.filter((ans, idx) => 
//         idx < actualAnswers.length && ans === actualAnswers[idx]
//       ).length;
//       break;
      
//     case 'division':
//       actualAnswers = comparisonPairs.map(([a, b]) => (a / b).toString());
//       correctCount = answers.filter((ans, idx) => 
//         idx < actualAnswers.length && ans === actualAnswers[idx]
//       ).length;
//       break;
//   }
  
// //   const accuracy = correctCount / expectedCount;
// //   const score = accuracy >= 0.8 ? 1 : accuracy >= 0.6 ? 0.5 : -0.25;
  
// //   setResult({ 
// //     correct: accuracy >= 0.8, 
// //     actualAnswer: `${correctCount}/${expectedCount} correct`, 
// //     score,
// //     userAnswers: answers,
// //     correctAnswers: actualAnswers,
// //     accuracy: (accuracy * 100).toFixed(1) + '%'
// //   });
  
// //   updatePerformanceData(accuracy >= 0.8, score);
// //   setAppState('result');
// // };

//   const accuracy = correctCount / expectedCount;
//   const isCorrect = accuracy >= 0.8; // Consider it correct if 80% or more answers are right
//   const score = correctCount * 2 + (expectedCount - correctCount) * (-1); // +2 for correct, -1 for wrong
  
//   setResult({ 
//     correct: isCorrect, 
//     actualAnswer: `${correctCount}/${expectedCount} correct`, 
//     score,
//     userAnswers: answers,
//     correctAnswers: actualAnswers,
//     accuracy: (accuracy * 100).toFixed(1) + '%'
//   });
  
//   updatePerformanceData(isCorrect, score);
//   setAppState('result');
// };

const checkAllAnswers = (answers) => {
  let correctCount = 0;
  let actualAnswers = [];
  
  const expectedCount = comparisonPairs.length;
  
  switch(gameType) {
    case 'subtraction':
      actualAnswers = comparisonPairs.map(([a, b]) => (a - b).toString());
      correctCount = answers.filter((ans, idx) => 
        idx < actualAnswers.length && ans === actualAnswers[idx]
      ).length;
      break;
      
    case 'multiplication':
      actualAnswers = comparisonPairs.map(([a, b]) => (a * b).toString());
      correctCount = answers.filter((ans, idx) => 
        idx < actualAnswers.length && ans === actualAnswers[idx]
      ).length;
      break;
      
    case 'division':
      actualAnswers = comparisonPairs.map(([a, b]) => (a / b).toString());
      correctCount = answers.filter((ans, idx) => 
        idx < actualAnswers.length && ans === actualAnswers[idx]
      ).length;
      break;
      case 'mixedMath':
  actualAnswers = comparisonPairs.map(([a, b, operation]) => {
    const result = operation === 'addition' ? a + b : a - b;
    return result.toString();
  });
  correctCount = answers.filter((ans, idx) => 
    idx < actualAnswers.length && ans === actualAnswers[idx]
  ).length;
  break;
  }
  
  const accuracy = correctCount / expectedCount;
  const isCorrect = accuracy >= 0.8; // 80% threshold
  const score = isCorrect ? 2 : -1; // +2 if 80%+ correct, -1 if below
  
  setResult({ 
    correct: isCorrect, 
    actualAnswer: `${correctCount}/${expectedCount} correct`, 
    score,
    userAnswers: answers,
    correctAnswers: actualAnswers,
    accuracy: (accuracy * 100).toFixed(1) + '%'
  });
  
  updatePerformanceData(isCorrect, score);
  setAppState('result');
};


// 7. ADD NUMBER PAD COMPONENT
// const NumberPad = () => (
//   <div className="number-pad">
//     <div className="number-pad-row">
//       {[7, 8, 9].map(num => (
//         <button key={num} onClick={() => handleNumberPadInput(num.toString())} className="number-btn">
//           {num}
//         </button>
//       ))}
//     </div>
//     <div className="number-pad-row">
//       {[4, 5, 6].map(num => (
//         <button key={num} onClick={() => handleNumberPadInput(num.toString())} className="number-btn">
//           {num}
//         </button>
//       ))}
//     </div>
//     <div className="number-pad-row">
//       {[1, 2, 3].map(num => (
//         <button key={num} onClick={() => handleNumberPadInput(num.toString())} className="number-btn">
//           {num}
//         </button>
//       ))}
//     </div>
//     <div className="number-pad-row">
//       <button onClick={() => handleNumberPadInput('negative')} className="number-btn special">
//         ±
//       </button>
//       <button onClick={() => handleNumberPadInput('0')} className="number-btn">
//         0
//       </button>
//       <button onClick={() => handleNumberPadInput('backspace')} className="number-btn special">
//         ⌫
//       </button>
//     </div>
//     <div className="number-pad-row">
//       <button onClick={() => handleNumberPadInput('clear')} className="number-btn clear">
//         Clear
//       </button>
//       <button 
//         onClick={() => {
//           console.log(`Manual submit clicked for question ${currentQuestionIndex + 1}`);
//           console.log(`Current answer: "${currentQuestionAnswer}"`);
//           submitCurrentQuestion();
//         }} 
//         className="number-btn submit"
//         // disabled={!currentQuestionAnswer.trim()}
//       >
//         Submit
//       </button>
//     </div>
//   </div>
// );
const handleNumberPadInput = (value, event) => {
  // Prevent event bubbling and default behavior
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  console.log(`Number pad input: ${value}, current answer: "${currentQuestionAnswer}"`);
  
  if (value === 'clear') {
    setCurrentQuestionAnswer('');
  } else if (value === 'backspace') {
    setCurrentQuestionAnswer(prev => prev.slice(0, -1));
  } else if (value === 'negative') {
    setCurrentQuestionAnswer(prev => 
      prev.startsWith('-') ? prev.slice(1) : '-' + prev
    );
  } else {
    // Add the number to current answer
    setCurrentQuestionAnswer(prev => prev + value);
  }
};
const NumberPad = () => (
  <div className="number-pad" style={{ position: 'relative', zIndex: 1000 }}>
    <div className="number-pad-row">
      {[7, 8, 9].map(num => (
        <button 
          key={num} 
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNumberPadInput(num.toString(), e);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="number-btn"
          style={{ pointerEvents: 'auto' }}
        >
          {num}
        </button>
      ))}
    </div>
    <div className="number-pad-row">
      {[4, 5, 6].map(num => (
        <button 
          key={num} 
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNumberPadInput(num.toString(), e);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="number-btn"
          style={{ pointerEvents: 'auto' }}
        >
          {num}
        </button>
      ))}
    </div>
    <div className="number-pad-row">
      {[1, 2, 3].map(num => (
        <button 
          key={num} 
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNumberPadInput(num.toString(), e);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="number-btn"
          style={{ pointerEvents: 'auto' }}
        >
          {num}
        </button>
      ))}
    </div>
    <div className="number-pad-row">
      <button 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNumberPadInput('negative', e);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="number-btn special"
        style={{ pointerEvents: 'auto' }}
      >
        ±
      </button>
      <button 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNumberPadInput('0', e);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="number-btn"
        style={{ pointerEvents: 'auto' }}
      >
        0
      </button>
      <button 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNumberPadInput('backspace', e);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="number-btn special"
        style={{ pointerEvents: 'auto' }}
      >
        ⌫
      </button>
    </div>
    <div className="number-pad-row">
      <button 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNumberPadInput('clear', e);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="number-btn clear"
        style={{ pointerEvents: 'auto' }}
      >
        Clear
      </button>
      <button 
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`Manual submit clicked for question ${currentQuestionIndex + 1}`);
          console.log(`Current answer: "${currentQuestionAnswer}"`);
          submitCurrentQuestion();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="number-btn submit"
        style={{ pointerEvents: 'auto' }}
      >
        Submit
      </button>
    </div>
  </div>
);
const handleNumberPadInputFixed = (value, event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  console.log(`Number pad clicked: ${value}`);
  
  // Use functional state updates to avoid race conditions
  if (value === 'clear') {
    setCurrentQuestionAnswer('');
    console.log('Cleared answer');
  } else if (value === 'backspace') {
    setCurrentQuestionAnswer(prev => {
      const newValue = prev.slice(0, -1);
      console.log(`Backspace: "${prev}" -> "${newValue}"`);
      return newValue;
    });
  } else if (value === 'negative') {
    setCurrentQuestionAnswer(prev => {
      const newValue = prev.startsWith('-') ? prev.slice(1) : '-' + prev;
      console.log(`Toggle negative: "${prev}" -> "${newValue}"`);
      return newValue;
    });
  } else {
    setCurrentQuestionAnswer(prev => {
      const newValue = prev + value;
      console.log(`Add digit: "${prev}" -> "${newValue}"`);
      return newValue;
    });
  }
};
  const showNumbersSequentially = (nums) => {
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < (gameType === 'comparison' ? comparisonPairs.length : nums.length)) {
        setCurrentIndex(index);
        index++;
      } else {
        clearInterval(interval);
        setShowingNumbers(false);
        setCurrentIndex(-1);
      }
    }, speed * 1000);
  };
  
  // Function to show pairs sequentially for math operations
  const showPairsSequentially = (pairs) => {
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < pairs.length) {
        setCurrentIndex(index);
        index++;
      } else {
        clearInterval(interval);
        setShowingNumbers(false);
        setCurrentIndex(-1);
      }
    }, speed * 1000);
  };
  
  const checkAnswer = () => {
    let correct = false;
    let actualAnswer = '';
    let score = 0;
    let maxScore = 1;
    
    switch(gameType) {
      case 'subtraction':
        // For subtraction, we expect comma-separated answers
        const subtractionAnswers = userAnswer.replace(/\s+/g, '').split(',');
        const correctSubtractionAnswers = comparisonPairs.map(([a, b]) => (a - b).toString());
        actualAnswer = correctSubtractionAnswers.join(',');
        
        // Check if all answers are correct
        correct = subtractionAnswers.length === correctSubtractionAnswers.length &&
                 subtractionAnswers.every((ans, idx) => ans === correctSubtractionAnswers[idx]);
        
        // Calculate score based on correct answers
        // const correctSubtractionCount = subtractionAnswers.filter((ans, idx) => 
        //   idx < correctSubtractionAnswers.length && ans === correctSubtractionAnswers[idx]
        // ).length;
        
        // maxScore = comparisonPairs.length;
        // score = Math.max(correctSubtractionCount - (comparisonPairs.length - correctSubtractionCount) * 0.25, 0);
         score = correct ? 2 : -1;
        break;
      
      case 'multiplication':
        // For multiplication, we expect comma-separated answers
        const multiplicationAnswers = userAnswer.replace(/\s+/g, '').split(',');
        const correctMultiplicationAnswers = comparisonPairs.map(([a, b]) => (a * b).toString());
        actualAnswer = correctMultiplicationAnswers.join(',');
        
        // Check if all answers are correct
        correct = multiplicationAnswers.length === correctMultiplicationAnswers.length &&
                 multiplicationAnswers.every((ans, idx) => ans === correctMultiplicationAnswers[idx]);
        
        // // Calculate score based on correct answers
        // const correctMultiplicationCount = multiplicationAnswers.filter((ans, idx) => 
        //   idx < correctMultiplicationAnswers.length && ans === correctMultiplicationAnswers[idx]
        // ).length;
        
        // maxScore = comparisonPairs.length;
        // score = Math.max(correctMultiplicationCount - (comparisonPairs.length - correctMultiplicationCount) * 0.25, 0);
         score = correct ? 2 : -1;
        break;
      
      case 'division':
        // For division, we expect comma-separated answers
        const divisionAnswers = userAnswer.replace(/\s+/g, '').split(',');
        const correctDivisionAnswers = comparisonPairs.map(([a, b]) => (a / b).toString());
        actualAnswer = correctDivisionAnswers.join(',');
        
        // Check if all answers are correct
        correct = divisionAnswers.length === correctDivisionAnswers.length &&
                 divisionAnswers.every((ans, idx) => ans === correctDivisionAnswers[idx]);
        
        // // Calculate score based on correct answers
        // const correctDivisionCount = divisionAnswers.filter((ans, idx) => 
        //   idx < correctDivisionAnswers.length && ans === correctDivisionAnswers[idx]
        // ).length;
        
        // maxScore = comparisonPairs.length;
        // score = Math.max(correctDivisionCount - (comparisonPairs.length - correctDivisionCount) * 0.25, 0);
         score = correct ? 2 : -1;
        break;
      
          // Add new total operation cases
    case 'totalAddition':
      const totalSum = numbers.reduce((sum, num) => sum + num, 0);
      actualAnswer = totalSum.toString();
      correct = userAnswer === actualAnswer;
       score = correct ? 2 : -1;
      break;
      
    // case 'totalSubtraction':
    //   // Start with the first number, then subtract all others
    //   const totalDifference = numbers.reduce((diff, num, idx) => 
    //     idx === 0 ? num : diff - num, 0);
    //   actualAnswer = totalDifference.toString();
    //   correct = userAnswer === actualAnswer;
    //    score = correct ? 2 : -1;
    //   break;

    // 2. Fix the checkAnswer function for totalSubtraction (around line 695)
case 'totalSubtraction':
  // Calculate total by starting with first number and subtracting the rest
  const totalDifference = numbers.reduce((result, num, idx) => {
    if (idx === 0) return num;
    return result - num;
  }, 0);
  
  actualAnswer = totalDifference.toString();
  correct = userAnswer === actualAnswer;
   score = correct ? 2 : -1;
  break;

    
      
    case 'totalMultiplication':
      const totalProduct = numbers.reduce((product, num) => product * num, 1);
      actualAnswer = totalProduct.toString();
      correct = userAnswer === actualAnswer;
       score = correct ? 2 : -1;
      break;
      
    case 'totalDivision':
      // Start with the first number, then divide by all others
      const totalQuotient = numbers.reduce((quotient, num, idx) => 
        idx === 0 ? num : quotient / num, 0);
      actualAnswer = totalQuotient.toString();
      correct = userAnswer === actualAnswer;
       score = correct ? 2 : -1;
      break;
        
      case 'memory':
        actualAnswer = numbers.join('');
        correct = userAnswer === actualAnswer;
         score = correct ? 2 : -1;
        break;
      case 'addition':
        actualAnswer = numbers.reduce((sum, num) => sum + num, 0).toString();
        correct = userAnswer === actualAnswer;
         score = correct ? 2 : -1;
        break;
      case 'counting':
        actualAnswer = numbers.filter(n => n === targetNumber).length.toString();
        correct = userAnswer === actualAnswer;
         score = correct ? 2 : -1;
        break;
      case 'pattern':
        const patternStep = numbers[1] - numbers[0];
        actualAnswer = (numbers[numbers.length - 1] + patternStep).toString();
        correct = userAnswer === actualAnswer;
         score = correct ? 2 : -1;
        break;
      case 'reverse':
        actualAnswer = [...numbers].reverse().join('');
        correct = userAnswer === actualAnswer;
         score = correct ? 2 : -1;
        break;
      case 'missing':
        const missingNumbers = missingIndices.map(idx => idx + 1).sort((a, b) => a - b).join(',');
        actualAnswer = missingNumbers;
        correct = userAnswer.replace(/\s+/g, '') === missingNumbers;
         score = correct ? 2 : -1;
        break;
      case 'oddeven':
        const oddCount = numbers.filter(n => n % 2 !== 0).length;
        const evenCount = numbers.filter(n => n % 2 === 0).length;
        actualAnswer = `Odd: ${oddCount}, Even: ${evenCount}`;
        const userCounts = userAnswer.toLowerCase().split(',');
        const userOdd = parseInt(userCounts[0]?.replace(/\D/g, '') || 0);
        const userEven = parseInt(userCounts[1]?.replace(/\D/g, '') || 0);
        correct = userOdd === oddCount && userEven === evenCount;
         score = correct ? 2 : -1;
        break;
      case 'multiples':
        actualAnswer = (targetNumber * (numbers.length + 1)).toString();
        correct = userAnswer === actualAnswer;
         score = correct ? 2 : -1;
        break;
      case 'comparison':
        const comparisons = userAnswer.replace(/\s+/g, '').split(',');
        const correctComparisons = comparisonPairs.map(([a, b]) => 
          a > b ? '>' : (a < b ? '<' : '=')
        );
        actualAnswer = correctComparisons.join(',');
        correct = comparisons.join('') === correctComparisons.join('');
        
        const correctCount = comparisons.filter((c, i) => c === correctComparisons[i]).length;
        maxScore = comparisonPairs.length;
        score = Math.max(correctCount - (comparisonPairs.length - correctCount) * 0.25, 0);
        break;
      case 'speed':
        const endNumber = numbers[numbers.length - 1];
        actualAnswer = endNumber.toString();
        correct = userAnswer === actualAnswer;
         score = correct ? 2 : -1;
        break;
      case 'symbol':
        const associations = userAnswer.replace(/\s+/g, '').split(',');
        const correctAssociations = numbers.map((n, i) => `${symbols[i]}=${n}`).join(',');
        actualAnswer = correctAssociations;
        correct = associations.join('') === numbers.map((n, i) => `${symbols[i]}${n}`).join('');
         score = correct ? 2 : -1;
        break;
      default:
        actualAnswer = numbers.join('');
        correct = userAnswer === actualAnswer;
         score = correct ? 2 : -1;
    }
    
    setResult({ correct, actualAnswer, score, maxScore });
    updatePerformanceData(correct, score, maxScore);
    setAppState('result');
  };
  
  const updatePerformanceData = (correct, score, maxScore) => {
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
          score: 0
        };
      }
      newData.gameTypes[gameType].plays += 1;
      newData.gameTypes[gameType].correct += correct ? 1 : 0;
      newData.gameTypes[gameType].score += score;
      
      if (!newData.dailyStats[today]) {
        newData.dailyStats[today] = {
          plays: 0,
          correct: 0,
          score: 0,
          gameTypes: {}
        };
      }
      newData.dailyStats[today].plays += 1;
      newData.dailyStats[today].correct += correct ? 1 : 0;
      newData.dailyStats[today].score += score;
      
      if (!newData.dailyStats[today].gameTypes[gameType]) {
        newData.dailyStats[today].gameTypes[gameType] = {
          plays: 0,
          correct: 0,
          score: 0
        };
      }
      newData.dailyStats[today].gameTypes[gameType].plays += 1;
      newData.dailyStats[today].gameTypes[gameType].correct += correct ? 1 : 0;
      newData.dailyStats[today].gameTypes[gameType].score += score;
      
      newData.history = newData.history || [];
      newData.history.unshift({
        date: today,
        timestamp: new Date().toISOString(),
        gameType,
        // difficulty,
        speed,
        count,
        correct,
        score,
        maxScore,
        userId
      });
      
      if (newData.history.length > 100) {
        newData.history = newData.history.slice(0, 100);
      }
      
      return newData;
    });
  };
  
// const resetGame = () => {
//   setAppState('setup');
//   setUserAnswer('');
//   setNumbers([]);
//   setCurrentIndex(0);
//   setShowingNumbers(false);
//   setTargetNumber(null);
//   setMissingIndices([]);
//   setSymbols([]);
//   setComparisonPairs([]);
//   setResult({ correct: false, actualAnswer: '', score: 0 });
  
//   // Clear new question-based game states
//   setCurrentQuestionIndex(0);
//   setQuestionAnswers([]);
//   setCurrentQuestionAnswer('');
//   setTimeRemaining(0);
  
//   // Clear addition game states
//   setAdditionNumbers([]);
//   setAdditionTimeRemaining(0);
//   setShowAdditionAnswer(false);
  
//   // Clear any running timers
//   if (questionTimer) {
//     clearInterval(questionTimer);
//     setQuestionTimer(null);
//   }
//   // if (additionTimer) {
//   //   clearInterval(additionTimer);
//   //   setAdditionTimer(null);
//   // } 


// // Reset digit inputs to default
// setFirstDigit(1);
// setSecondDigit(1);

//  if (beepInterval) {
//     clearInterval(beepInterval);
//     setBeepInterval(null);
//   }
// };

// 6. UPDATE resetGame to clear global timer
const resetGame = () => {
  setAppState('setup');
  setUserAnswer('');
  setNumbers([]);
  setCurrentIndex(0);
  setShowingNumbers(false);
  setTargetNumber(null);
  setMissingIndices([]);
  setSymbols([]);
  setComparisonPairs([]);
  setResult({ correct: false, actualAnswer: '', score: 0 });
  
  // Clear question-based game states
  setCurrentQuestionIndex(0);
  setQuestionAnswers([]);
  setCurrentQuestionAnswer('');
  setTimeRemaining(0);
  
  // Clear addition game states
  setAdditionNumbers([]);
  setAdditionTimeRemaining(0);
  setShowAdditionAnswer(false);
  
  // Clear ALL timers - including global timer
  if (questionTimer) {
    clearInterval(questionTimer);
    setQuestionTimer(null);
  }
  if (additionTimer) {
    clearInterval(additionTimer);
    setAdditionTimer(null);
  }
  if (totalGameTimer) {
    clearInterval(totalGameTimer);
    setTotalGameTimer(null);
  }
  if (beepInterval) {
    clearInterval(beepInterval);
    setBeepInterval(null);
  }
  
  // Reset global game timer states
  setTotalGameTime(0);
  setGameStartTime(null);
  
  setFirstDigit(1);
  setSecondDigit(1);
};

  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const clearPerformanceData = () => {
    const emptyData = {
      totalGames: 0,
      totalCorrect: 0,
      totalScore: 0,
      gameTypes: {},
      dailyStats: {},
      history: []
    };
    
    setPerformanceData(emptyData);
    localStorage.setItem('avecusPerformance', JSON.stringify(emptyData));
    
    if (userId) {
      axios.delete(`${API_URL}/performance/${userId}`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      })
      .catch(err => {
        console.error("Error clearing server data:", err);
        setError("Failed to clear data from server.");
      });
    }
    
    setShowConfirmDialog(false);
  };
  
  const getDisplayText = () => {
    switch(gameType) {
      case 'subtraction':
        if (currentIndex >= 0 && currentIndex < comparisonPairs.length) {
          const [a, b] = comparisonPairs[currentIndex];
          return `${a} - ${b} = ?`;
        }
        return '';
      case 'multiplication':
        if (currentIndex >= 0 && currentIndex < comparisonPairs.length) {
          const [a, b] = comparisonPairs[currentIndex];
          return `${a} × ${b} = ?`;
        }
        return '';
      case 'division':
        if (currentIndex >= 0 && currentIndex < comparisonPairs.length) {
          const [a, b] = comparisonPairs[currentIndex];
          return `${a} ÷ ${b} = ?`;
        }
        return '';

        // Add new total operation cases
    case 'totalAddition':
      if (currentIndex === 0) return `${numbers[currentIndex]}`;
      return `${numbers[currentIndex]}${currentIndex < numbers.length - 1 ? ' +' : ' = ?'}`;
      
    // case 'totalSubtraction':
    //   if (currentIndex === 0) return `${numbers[currentIndex]}`;
    //   return `${numbers[currentIndex]}${currentIndex < numbers.length - 1 ? ' -' : ' = ?'}`;
    
      case 'totalSubtraction':
    if (currentIndex === 0) {
      return `${numbers[currentIndex]}`; // First number
    } else {
      // Show the operation as subtraction
      return `- ${numbers[currentIndex]}${currentIndex < numbers.length - 1 ? '' : ' = ?'}`;
    }

    case 'totalMultiplication':
      if (currentIndex === 0) return `${numbers[currentIndex]}`;
      return `${numbers[currentIndex]}${currentIndex < numbers.length - 1 ? ' ×' : ' = ?'}`;
      
    case 'totalDivision':
      if (currentIndex === 0) return `${numbers[currentIndex]}`;
      return `${numbers[currentIndex]}${currentIndex < numbers.length - 1 ? ' ÷' : ' = ?'}`;
      
      case 'memory':
        return numbers[currentIndex];
      case 'addition':
        return `${numbers[currentIndex]}${currentIndex < numbers.length - 1 ? ' +' : ''}`;
      case 'counting':
        return `${numbers[currentIndex]} (Target: ${targetNumber})`;
      case 'pattern':
        return numbers[currentIndex];
      case 'reverse':
        return numbers[currentIndex];
      case 'missing':
        return missingIndices.includes(currentIndex) ? '?' : currentIndex + 1;
      case 'oddeven':
        return `${numbers[currentIndex]} (${numbers[currentIndex] % 2 === 0 ? 'Even' : 'Odd'})`;
      case 'multiples':
        return `${numbers[currentIndex]} (${targetNumber} × ${currentIndex + 1})`;
      case 'comparison':
        const [a, b] = comparisonPairs[currentIndex];
        return `${a} ? ${b}`;
      case 'speed':
        return numbers[currentIndex];
      case 'symbol':
        return `${symbols[currentIndex]} = ${numbers[currentIndex]}`;
      default:
        return numbers[currentIndex];
    }
  };
  
  const getInstructionText = () => {
    switch(gameType) {
      case 'subtraction':
        return "Solve each subtraction problem (comma-separated answers)";
      case 'multiplication':
        return "Solve each multiplication problem (comma-separated answers)";
      case 'division':
        return "Solve each division problem (comma-separated answers)";
      
      case 'mixedMath':
  return "Enter answers separated by commas (e.g., 15,3,8)";


            // Add new total operation cases
    case 'totalAddition':
      return "Add ALL numbers together";
    case 'totalSubtraction':
      return "Subtract all numbers from the first number";
    case 'totalMultiplication':
      return "Multiply ALL numbers together";
    case 'totalDivision':
      return "Divide the first number by all other numbers";

      case 'memory':
        return "Remember the sequence of numbers";
      case 'addition':
        return "Add all the numbers together";
      case 'counting':
        return `Count how many times ${targetNumber} appears`;
      case 'pattern':
        return "Identify the pattern and find the next number";
      case 'reverse':
        return "Remember the numbers in reverse order";
      case 'missing':
        return "Identify the missing numbers (comma separated)";
      case 'oddeven':
        return "Count how many odd and even numbers (format: odd:X, even:Y)";
      case 'multiples':
        return `These are multiples of ${targetNumber}. What comes next?`;
      case 'comparison':
        return "For each pair, enter >, <, or = (comma separated)";
      case 'speed':
        return "What's the last number in the sequence?";
      case 'symbol':
        return "Remember which symbol pairs with which number (format: symbol=number, ...)";
      default:
        return "Remember the numbers";
    }
  };
  
  const getPlaceholderText = () => {
    switch(gameType) {
      case 'subtraction':
        return "Enter answers separated by commas (e.g., 3,7,2)";
      case 'multiplication':
        return "Enter answers separated by commas (e.g., 12,15,20)";
      case 'division':
        return "Enter answers separated by commas (e.g., 4,3,5)";

           // Add new total operation cases
    case 'totalAddition':
      return "Enter the sum of all numbers";
    case 'totalSubtraction':
      return "Enter the result of subtracting all numbers from the first";
    case 'totalMultiplication':
      return "Enter the product of all numbers";
    case 'totalDivision':
      return "Enter the result of dividing the first number by all others";

      case 'memory':
        return "Enter the sequence (e.g., 38745)";
      case 'addition':
        return "Enter sum (e.g., 42)";
      case 'counting':
        return `Enter count of ${targetNumber} (e.g., 3)`;
      case 'pattern':
        return "Enter next number in pattern";
      case 'reverse':
        return "Enter reversed sequence";
      case 'missing':
        return "Enter missing numbers (e.g., 3,5,9)";
        case 'oddeven':
        return "Enter count (e.g., odd:4, even:6)";
      case 'multiples':
        return `Enter next multiple of ${targetNumber}`;
      case 'comparison':
        return "Enter >, <, or = for each pair (e.g., >,<,=,>,=)";
      case 'speed':
        return "Enter the last number in sequence";
      case 'symbol':
        return "Enter symbol=number pairs (e.g., ★=5,♦=3)";
      default:
        return "Enter your answer";
    }
  };

  // Navigate to stats page
  const goToStats = () => {
    navigate('/stats', { state: { performanceData } });
  };

  // Navigate to login page
  const goToLogin = () => {
    navigate('/login');
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserId(null);
    setAppState('setup');
    // No need to clear performance data as we want to keep local progress
  };

  useEffect(() => {
    // Simulate loading time and show Netflix-style loading animation
    if (appState === 'setup') {
      setLoading(true);
      setShowImage(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, [appState]);

  // if (loading && showImage) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
  //       <Netflix />
  //       <div className="mt-8">
  //         <ThreeDot color="#E50914" size="medium" />
  //       </div>
  //     </div>
  //   );
  // }

  const renderLoginState = () => {
    const token = localStorage.getItem('token');
    
    return (
      <div className="avc-flex avc-items-center">
        {userId ? (
          <div className="avc-text-sm avc-text-green-600 avc-mr-4">
            ✓ Data syncing to account
          </div>
        ) : (
          <a href="/login" className="avc-bg-green-500 avc-text-white avc-py-1 avc-px-3 avc-rounded avc-hover:bg-green-600 avc-text-sm avc-mr-2">
            Login to sync data
          </a>
        )}
      </div>
    );
  };
  
const renderSetup = () => (
  <div className='avc-rendersetup'>
    <div className="avc-page-background">
      <div className="avc-setup-container">
        <h1 className="avc-title">
          Avecus Learning App
        </h1>

        <div className="avc-login-section">
          {renderLoginState()}
          <button 
            onClick={() => navigate('/')}
            className="avc-dashboard-btn"
          >
            View Dashboard
          </button>
        </div>

        {error && (
          <div className="avc-error-banner">
            <span>{error}</span>
            <button 
              className="avc-error-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="avc-space-y-4">
          <div className="avc-input-group">
            <label>Challenge Type:</label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="avc-select"
            >
              {gameModes.map(mode => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {/* <div className="avc-input-group">
            <label>Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="avc-select"
            >
              <option value="single">Single Digit (1-9)</option>
              <option value="double">Double Digit (10-99)</option>
              <option value="triple">Triple Digit (100-999)</option>
            </select>
          </div> */}

          <div className="avc-input-group">
  {/* <label>Difficulty:</label> */}
  {/* {['division', 'multiplication'].includes(gameType) ? (
    <div className="avc-difficulty-grid">
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="avc-select"
      >
        <option value="single">Single ÷ Single / Single × Single</option>
        <option value="double">Double ÷ Double / Double × Double</option>
        <option value="triple">Triple ÷ Triple / Triple × Triple</option>
        <option value="singleToDouble">Single → Double (Single ÷ Single = Double)</option>
        <option value="doubleToSingle">Double → Single (Double ÷ Single = Single)</option>
      </select>
    </div>
  ) : (
    <select
      value={difficulty}
      onChange={(e) => setDifficulty(e.target.value)}
      className="avc-select"
    >
      <option value="single">Single Digit (1-9)</option>
      <option value="double">Double Digit (10-99)</option>
      <option value="triple">Triple Digit (100-999)</option>
    </select>
  )} */}

  {['subtraction', 'multiplication', 'division', 'addition', 'mixedMath'].includes(gameType) && (
  <div className="avc-input-group">
    <label>Number of Digits:</label>
    <div className="avc-digit-inputs">
      <div className="avc-digit-input-group">
        <label>First Number Digits:</label>
        <input
          type="number"
          value={firstDigit === 0 ? '' : firstDigit}
          onChange={(e) => {
            const val = e.target.value;
            setFirstDigit(val === '' ? '' : Math.max(1, Math.min(6, Number(val))));
          }}
          onFocus={(e) => e.target.select()}
          min="1"
          max="6"
          className="avc-input avc-digit-input"
          placeholder="1-6"
        />
      </div>
      <div className="avc-digit-input-group">
        <label>Second Number Digits:</label>
        <input
          type="number"
          value={secondDigit === 0 ? '' : secondDigit}
          onChange={(e) => {
            const val = e.target.value;
            setSecondDigit(val === '' ? '' : Math.max(1, Math.min(6, Number(val))));
          }}
          onFocus={(e) => e.target.select()}
          min="1"
          max="6"
          className="avc-input avc-digit-input"
          placeholder="1-6"
        />
      </div>
    </div>
  </div>
)}

{!['subtraction', 'multiplication', 'division', 'addition', 'mixedMath'].includes(gameType) && (
  <div className="avc-input-group">
    <label>Difficulty:</label>
    <select
      value={firstDigit === 1 ? 'single' : firstDigit === 2 ? 'double' : 'triple'}
      onChange={(e) => {
        const val = e.target.value;
        setDifficulty(e.target.value)
        if (val === 'single') { setFirstDigit(1); setSecondDigit(1); }
        else if (val === 'double') { setFirstDigit(2); setSecondDigit(2); }
        else { setFirstDigit(3); setSecondDigit(3); }
          
      }}
      className="avc-select"
    >
      <option value="single">Single Digit (1-9)</option>
      <option value="double">Double Digit (10-99)</option>
      <option value="triple">Triple Digit (100-999)</option>
    </select>
  </div>
)}
</div>

          {/* <div className="avc-input-group">
            <label>Speed (seconds):</label>
            <input
              type="number"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              step="0.1"
              min="0.1"
              max="5"
              className="avc-input"
            />
          </div> */}

          <div className="avc-input-group">
            <label>Time Interval (seconds)</label>
  <input
    type="number"
    value={speed === 0 ? '' : speed}
    onChange={(e) => {
      const val = e.target.value;
      setSpeed(val === '' ? '' : Number(val));
    }}
    onFocus={(e) => e.target.select()}
    step="0.1"
    min="0.1"
    max="5"
    className="avc-input"
    placeholder="Enter speed in seconds"
  />
</div>

          {/* <div className="avc-input-group">
            <label>Number Count:</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min="3"
              max="20"
              className="avc-input"
            />
          </div> */}

          <div className="avc-input-group">
            <label>Number Of Questions</label>
  <input
    type="number"
    value={count === 0 ? '' : count}
    onChange={(e) => {
      const val = e.target.value;
      setCount(val === '' ? '' : Number(val));
    }}
    onFocus={(e) => e.target.select()}
    min="3"
    max="20"
    className="avc-input"
    placeholder="Enter number count"
  />
</div>

          <button 
            onClick={startGame}
            className="avc-start-btn"
          >
            Start Challenge
          </button>
        </div>
      </div>
    </div>
  </div>
);

// REPLACE your entire renderGame function with this complete version:

const renderGame = () => {
  // For addition game - show all numbers at once with timer
  // if (gameType === 'addition') {
  //   return (
  //     <div className='ask-q'>
  //       <div className="avc-game-container">
  //         <div className="addition-timer-bar">
  //           <div 
  //             className="timer-progress" 
  //             style={{ width: `${(additionTimeRemaining / (speed * 1000)) * 100}%` }}
  //           ></div>
  //         </div>
          
  //         {!showAdditionAnswer ? (
  //           <div className="addition-display">
  //             <h2 className="addition-instruction">Add all these numbers together:</h2>
  //             <div className="addition-numbers-grid">
  //               {additionNumbers.map((num, index) => (
  //                 <div key={index} className="addition-number">
  //                   {num}
  //                 </div>
  //               ))}
  //             </div>
  //             <div className="addition-timer-text">
  //               Time remaining: {Math.ceil(additionTimeRemaining / 1000)}s
  //             </div>
  //           </div>
  //         ) : (
  //           <div className="addition-input-section">
  //             <h2 className="addition-instruction">Time's up! Enter your answer:</h2>
  //             {/* <div className="addition-numbers-small">
  //               {additionNumbers.join(' + ')} = ?
  //             </div> */}
  //             <input
  //               type="number"
  //               value={userAnswer}
  //               onChange={(e) => setUserAnswer(e.target.value)}
  //               className="addition-answer-input"
  //               placeholder="Enter the sum"
  //               autoFocus
  //             />
  //             <div className="addition-buttons">
  //               <button onClick={checkAdditionAnswer} className="addition-check-btn">
  //                 Check Answer
  //               </button>
  //               <button onClick={showCorrectAdditionAnswer} className="addition-show-btn">
  //                 Show Answer
  //               </button>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  // For addition game - show numbers one by one, then input
if (gameType === 'addition') {
  if (additionShowingNumbers) {
    // Show numbers one by one
    return (
      <div className='ask-q'>
        <div className="avc-game-container">
                    <div className="addition-timer-bar">
             <div 
               className="timer-progress" 
               style={{ width: `${(additionTimeRemaining / (speed * 1000)) * 100}%` }}
             ></div>
           </div>
          <div className="addition-instruction">
            <h2>Remember these numbers to add them:</h2>
          </div>
          
          <div className="addition-numbers-grid">
            {additionNumbers.map((num, index) => (
              <div 
                key={index} 
                className={`addition-number ${index <= additionCurrentIndex ? 'visible' : 'hidden'}`}
              >
                {index <= additionCurrentIndex ? num : '?'}
              </div>
            ))}
          </div>
          
          <div className="addition-progress">
            Showing number {additionCurrentIndex + 1} of {additionNumbers.length}
          </div>
                        <div className="addition-timer-text">
                Time remaining: {Math.ceil(additionTimeRemaining / 1000)}s
              </div>

        </div>
      </div>
    );
  } else {
    // Show input after all numbers are displayed
    return (
      <div className='ask-q'>
        <div className="avc-game-container">
          <div className="addition-input-section">
            <h2 className="addition-instruction">Now add all the numbers together:</h2>
            {/* <div className="addition-numbers-small">
              {additionNumbers.join(' + ')} = ?
            </div> */}

            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="addition-answer-input"
              placeholder="Enter the sum"
              autoFocus
            />
            <div className="addition-buttons">
              <button onClick={checkAdditionAnswer} className="addition-check-btn">
                Check Answer
              </button>
              {/* <button onClick={showCorrectAdditionAnswer} className="addition-show-btn">
                Show Answer
              </button> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


  
  // For math operation games (subtraction, multiplication, division) - question by question
//   if (['subtraction', 'multiplication', 'division'].includes(gameType)) {
//     const currentPair = comparisonPairs[currentQuestionIndex];
//     if (!currentPair) return null;
    
//     const [a, b] = currentPair;
//     let operatorSymbol = '';
    
//     switch(gameType) {
//       case 'subtraction':
//         operatorSymbol = ' - ';
//         break;
//       case 'multiplication':
//         operatorSymbol = ' × ';
//         break;
//       case 'division':
//         operatorSymbol = ' ÷ ';
//         break;
//     }
    
//     return (
//       <div className='ask-q'>
//         <div className="avc-game-container">
//           <div className="question-timer-bar">
//             <div 
//               className="timer-progress" 
//               style={{ width: `${(timeRemaining / (speed * 1000)) * 100}%` }}
//             ></div>
//           </div>
          
//           <div className="question-counter">
//             Question {currentQuestionIndex + 1} of {comparisonPairs.length}
//           </div>
          
//           <div className="math-question-display">
//             <div className="math-problem">
//               {a} {operatorSymbol} {b} = ?
//             </div>
            
//             <div className="answer-input-section">
//               {/* <input
//                 type="text"
//                 value={currentQuestionAnswer}
//                 className="question-answer-input"
//                 placeholder="Your answer"
//                 readOnly
//               /> */}
//               <input
//   readOnly                    // iOS + Android: blocks keyboard
//   inputMode="none"            // extra hint for Android/Chrome
//   onFocus={(e) => e.target.blur()} // belt-and-suspenders
  
//   type="text"
//   value={currentQuestionAnswer}
//   className="question-answer-input"
//   placeholder="Your answer"
//   onChange={handleKeyboardInput}
//   onKeyDown={(e) => { if (e.key === 'Enter') submitCurrentQuestion(); }}
//   autoFocus
// />

//             </div>
            
//             <NumberPad />
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   // For all other game types (existing functionality)
//   return (
//     <div className='ask-q'>
//       <div className="avc-game-container">
//         {showingNumbers ? (
//           <div>
//             <h2 className="avc-game-instruction-header">
//               {getInstructionText()}
//             </h2>
//             <div className="avc-game-display-container">
//               {getDisplayText()}
//             </div>
//             <div className="avc-game-progress-indicator">
//               Showing {currentIndex + 1} of {gameType === 'comparison' ? comparisonPairs.length : numbers.length}
//             </div>
//           </div>
//         ) : (
//           <div className="avc-game-input-container">
//             <h2 className="avc-game-instruction-header">
//               {getInstructionText()}
//             </h2>
//             <input
//               type="text"
//               value={userAnswer}
//               onChange={(e) => setUserAnswer(e.target.value)}
//               className="avc-game-answer-input"
//               placeholder={getPlaceholderText()}
//               autoFocus
//             />
//             <button
//               onClick={checkAnswer}
//               className="avc-game-check-button"
//             >
//               Check Answer
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

 if (!['subtraction', 'multiplication', 'division','mixedMath'].includes(gameType)) {
    return null;
  }
  
  const currentPair = comparisonPairs[currentQuestionIndex];
  if (!currentPair) return null;
  
  const [a, b] = currentPair;
  let operatorSymbol = '';
  
  switch(gameType) {
    case 'subtraction': operatorSymbol = ' - '; break;
    case 'multiplication': operatorSymbol = ' × '; break;
    case 'division': operatorSymbol = ' ÷ '; break;
    case 'mixedMath':
        const operation = currentPair[2]; // Get the operation from the third element
        operatorSymbol = operation === 'addition' ? ' + ' : ' - ';
        break;
  }
  
  const progressPercentage = totalGameTime > 0 ? (timeRemaining / totalGameTime) * 100 : 0;
  
  return (
    <div className='ask-q'>
      <div className="avc-game-container">
        <div className="question-timer-bar">
          <div 
            className="timer-progress" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="question-counter">
          Question {currentQuestionIndex + 1} of {comparisonPairs.length}
          <div className="time-info">
            <strong>{Math.ceil(timeRemaining / 1000)}s TOTAL remaining</strong>
            <br />
            <small>Use time as you wish across all questions</small>
            <br />
            <small>Game will auto-end when time runs out</small>
          </div>
        </div>
        
        <div className="math-question-display">
          <div className="math-problem">
            {a} {operatorSymbol} {b} = ?
          </div>
          
          <div className="answer-input-section">
            <input
              type="text"
              value={currentQuestionAnswer}
              className="question-answer-input"
              placeholder="Your answer"
              onChange={handleKeyboardInput}
              onKeyDown={(e) => { if (e.key === 'Enter') submitCurrentQuestion(); }}
              autoFocus
            />
          </div>
          
          <NumberPad />
          
          <div className="submit-info">
            <div>Press Submit to move to next question</div>
            <div>Or continue using your remaining time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// REPLACE your renderResult function with this enhanced version:
const renderResult = () => {
  if (!result) return null;

  return (
    <div className="avc-result-screen-container">
      <div className="avc-result-card">
        <div className="avc-result-header">
          <h2>Game Result</h2>
          <div className={`avc-result-message ${result.correct ? 'avc-correct' : 'avc-incorrect'}`}>
            <span className="avc-emoji">
              {result.correct ? "Correct! 🎉" : "Not quite right 😕"}
            </span>
          </div>
        </div>

        <div className="avc-result-details">
          {/* Show detailed results for math operations */}
          {['subtraction', 'multiplication', 'division'].includes(gameType) && result.userAnswers && result.correctAnswers ? (
            <div className="avc-detailed-results">
              <div className="avc-result-summary">
                <span className="avc-detail-label">Overall Result:</span>
                <span className="avc-detail-value">{result.actualAnswer}</span>
                {result.accuracy && (
                  <span className="avc-detail-value">Accuracy: {result.accuracy}</span>
                )}
              </div>
              
              <div className="avc-question-breakdown">
                <h3>Question Breakdown:</h3>
                {comparisonPairs.map((pair, index) => {
                  const [a, b] = pair;
                  const userAns = result.userAnswers[index] || 'No answer';
                  const correctAns = result.correctAnswers[index];
                  const isCorrect = userAns === correctAns;
                  
                  let operation = '';
                  switch(gameType) {
                    case 'subtraction': operation = ' - '; break;
                    case 'multiplication': operation = ' × '; break;
                    case 'division': operation = ' ÷ '; break;
                  }
                  
                  return (
                    <div key={index} className={`avc-question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <span className="question">{a}{operation}{b} = </span>
                      <span className="user-answer">Your: {userAns}</span>
                      <span className="correct-answer">Correct: {correctAns}</span>
                      <span className="status">{isCorrect ? '✓' : '✗'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Standard result display for other game types
            <>
              <div className="avc-result-detail">
                <span className="avc-detail-label">Your Answer:</span>
                <span className="avc-detail-value">{userAnswer}</span>
              </div>
              <div className="avc-result-detail">
                <span className="avc-detail-label">Correct Answer:</span>
                <span className="avc-detail-value">{result.actualAnswer}</span>
              </div>
            </>
          )}
          
          <div className="avc-result-detail">
            <span className="avc-detail-label">Score:</span>
            <span className={`avc-detail-value ${result.score > 0 ? 'avc-positive-score' : 'avc-negative-score'}`}>
              {result.score > 0 ? "+" : ""}{result.score.toFixed(2)}
              {result.maxScore > 1 && ` of ${result.maxScore}`}
            </span>
          </div>
        </div>

        <div className="avc-result-actions">
          <button 
            onClick={() => {
              resetGame();
              startGame();
            }}
            className="avc-btn avc-btn-retry"
          >
            <span className="avc-emoji">🔄</span>
            <span>Try Again</span>
          </button>

          <button 
            onClick={() => navigate('/')}
            className="avc-btn avc-btn-dashboard"
          >
            <span className="avc-emoji">🏠</span>
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
  
  return (
    <div className="app-container">
      {appState === 'setup' && renderSetup()}
      {appState === 'game' && renderGame()}
      {appState === 'result' && renderResult()}
    </div>
  );
};

export default AvecusApp;