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
  const [gameType, setGameType] = useState('multiplication');
  const [difficulty, setDifficulty] = useState('single');
  const [firstDigit, setFirstDigit] = useState(1);
  const [secondDigit, setSecondDigit] = useState(1);
  const [speed, setSpeed] = useState(2);
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
  
// With these:
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [questionAnswers, setQuestionAnswers] = useState([]);
const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState('');
const [questionTimer, setQuestionTimer] = useState(null);
const [timeRemaining, setTimeRemaining] = useState(0);
const [gameElapsedTime, setGameElapsedTime] = useState(0);
const [availableQuestions, setAvailableQuestions] = useState(new Set([0])); // Questions user can access
const [autoSubmitTimer, setAutoSubmitTimer] = useState(null);

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

const [additionCurrentTimer, setAdditionCurrentTimer] = useState(0);
const [subtractionCurrentTimer, setSubtractionCurrentTimer] = useState(0);
const [mixedMathTimer, setMixedMathTimer] = useState(0);

// 2. ADD new state variables for subtraction display
const [subtractionNumbers, setSubtractionNumbers] = useState([]);
const [subtractionCurrentIndex, setSubtractionCurrentIndex] = useState(0);
const [subtractionShowingNumbers, setSubtractionShowingNumbers] = useState(true);
const [showSubtractionAnswer, setShowSubtractionAnswer] = useState(false);
const [subtractionTimeRemaining, setSubtractionTimeRemaining] = useState(0);
const [subtractionTimer, setSubtractionTimer] = useState(null);
const [gameIntervalTimer, setGameIntervalTimer] = useState(null);

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

//   useEffect(() => {
//   if (appState === 'result' && !result) {
//     console.warn('Result state without result data - staying in setup');
//     setAppState('setup');
//   }
// }, [appState, result]);

// 5. ADD this useEffect to ensure proper cleanup:
useEffect(() => {
  return () => {
    // Cleanup function for component unmount
    const allTimers = [
      questionTimer, additionTimer, totalGameTimer, 
      beepInterval, autoSubmitTimer, gameIntervalTimer
    ];
    
    allTimers.forEach(timer => {
      if (timer) {
        clearInterval(timer);
        clearTimeout(timer);
      }
    });
  };
}, []); // Empty dependency array - runs only on unmount

useEffect(() => {
  // Set appropriate defaults when game type changes
  if (gameType === 'subtraction') {
    // For subtraction, default to double digits
    if (firstDigit === 1) {
      setFirstDigit(2);
      setSecondDigit(2);
      setDifficulty('double');
    }
  } else if (!['multiplication', 'division'].includes(gameType)) {
    // For other games (except multiplication/division), default to single digits
    if (firstDigit === 0 || firstDigit === '') {
      setFirstDigit(1);
      setSecondDigit(1);
      setDifficulty('single');
    }
  }
}, [gameType]);


const renderGameWithErrorHandling = () => {
  try {
    // Your existing renderGame logic here, but wrap math operations in try-catch
    
    // For math operation games - enhanced error handling
    if (['multiplication', 'division'].includes(gameType)) {
      if (!comparisonPairs || comparisonPairs.length === 0) {
        console.error('No comparison pairs available');
        return (
          <div className="avc-game-container">
            <div className="error-message">
              <h2>Game Error</h2>
              <p>Unable to load questions. Please try again.</p>
              <button onClick={() => setAppState('setup')} className="avc-btn">
                Back to Setup
              </button>
            </div>
          </div>
        );
      }
      
      const currentPair = comparisonPairs[currentQuestionIndex];
      if (!currentPair || currentPair.length < 2) {
        console.error('Invalid current pair:', currentPair);
        return (
          <div className="avc-game-container">
            <div className="error-message">
              <h2>Question Error</h2>
              <p>Invalid question data. Returning to setup.</p>
            </div>
          </div>
        );
      }
      
      // Your existing math operations rendering logic continues here...
      // (Keep the rest of your renderGame function as it was)
    }
    
    // Continue with rest of renderGame function...
  } catch (error) {
    console.error('Error in renderGame:', error);
    return (
      <div className="avc-game-container">
        <div className="error-message">
          <h2>Rendering Error</h2>
          <p>An error occurred while loading the game.</p>
          <button onClick={() => setAppState('setup')} className="avc-btn">
            Back to Setup
          </button>
        </div>
      </div>
    );
  }
};

// FIX 6: Additional debugging and monitoring for timer expiry
const debugTimerExpiry = () => {
  console.log('=== TIMER EXPIRY DEBUG ===');
  console.log('Current app state:', appState);
  console.log('Has comparison pairs:', !!comparisonPairs?.length);
  console.log('Current question index:', currentQuestionIndex);
  console.log('Question answers:', questionAnswers);
  console.log('Current question answer:', currentQuestionAnswer);
  console.log('Time remaining:', timeRemaining);
  console.log('Game elapsed time:', gameElapsedTime);
};

// FIX 7: Enhanced monitoring useEffect - ADD THIS TO YOUR COMPONENT
// useEffect(() => {
//   // Monitor app state changes
//   console.log('App state changed to:', appState);
  
//   if (appState === 'game' && timeRemaining <= 0 && totalGameTimer === null) {
//     console.log('DETECTED: Game state but no time remaining and no active timer');
//     console.log('This might be the white screen issue - forcing result check');
    
//     // Check if we have valid game data
//     if (comparisonPairs && comparisonPairs.length > 0) {
//       console.log('Valid game data found - calling forceEndGame');
//       forceEndGame();
//     } else {
//       console.log('No valid game data - returning to setup');
//       setAppState('setup');
//     }
//   }
// }, [appState, timeRemaining, totalGameTimer, comparisonPairs]);

// FIX 8: Add error boundary component for better error handling
const GameErrorBoundary = ({ children, onError }) => {
  try {
    return children;
  } catch (error) {
    console.error('Game Error Boundary caught error:', error);
    onError && onError(error);
    return (
      <div className="avc-game-container">
        <div className="error-message" style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '5px',
          margin: '20px'
        }}>
          <h2>Game Error</h2>
          <p>An unexpected error occurred. Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

// FIX 9: Enhanced renderGame with white screen prevention
const renderGameEnhanced = () => {
  // Add white screen detection
  if (appState === 'game' && (!comparisonPairs || comparisonPairs.length === 0) && 
      ['multiplication', 'division'].includes(gameType)) {
    console.log('WHITE SCREEN DETECTED: No comparison pairs in game state');
    return (
      <div className="avc-game-container">
        <div className="loading-message">
          <h2>Loading Questions...</h2>
          <p>Please wait while we prepare your questions.</p>
          <button 
            onClick={() => setAppState('setup')}
            style={{
              backgroundColor: '#6c5ce7',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  // Your existing renderGame logic goes here...
  // But wrap it in the error boundary
  return (
    <GameErrorBoundary onError={(error) => {
      console.error('Render error:', error);
      setAppState('setup');
      alert('A rendering error occurred. Returning to setup.');
    }}>
      {/* Your existing renderGame content */}
    </GameErrorBoundary>
  );
};

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
}
`;

// 7. Additional CSS to ensure result screen stays visible:
const additionalResultCSS = `
.avc-result-screen-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  background-color: rgba(0, 0, 0, 0.8) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  pointer-events: auto !important;
}

.avc-result-card {
  background-color: white !important;
  padding: 20px !important;
  border-radius: 10px !important;
  max-width: 90vw !important;
  max-height: 90vh !important;
  overflow: auto !important;
  min-width: 300px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
  pointer-events: auto !important;
  position: relative !important;
}

/* Ensure no other elements can interfere */
.avc-result-screen-container * {
  pointer-events: auto !important;
}
`;

// Add the additional CSS to your existing additionalCSS
const combinedCSS = additionalCSS + additionalResultCSS;

const generateSubtractionNumbers = () => {
  const nums = [];
  const digits = firstDigit || 1;
  
  // Generate first (largest) number
  let firstNum;
  if (digits === 1) firstNum = Math.floor(Math.random() * 5) + 5; // 5-9
  else if (digits === 2) firstNum = Math.floor(Math.random() * 50) + 50; // 50-99
  else if (digits === 3) firstNum = Math.floor(Math.random() * 500) + 500; // 500-999
  else if (digits === 4) firstNum = Math.floor(Math.random() * 5000) + 5000;
  else if (digits === 5) firstNum = Math.floor(Math.random() * 50000) + 50000;
  else if (digits === 6) firstNum = Math.floor(Math.random() * 500000) + 500000;
  
  nums.push(firstNum);
  
  let remaining = firstNum * 0.8; // Keep 20% buffer to ensure positive result
  
  // Generate remaining numbers that won't exceed the buffer
  for (let i = 1; i < count; i++) {
    const remainingSlots = count - i;
    const maxForThisSlot = Math.floor(remaining / remainingSlots);
    
    let num;
    if (digits === 1) num = Math.min(Math.floor(Math.random() * maxForThisSlot) + 1, 9);
    else if (digits === 2) num = Math.min(Math.floor(Math.random() * maxForThisSlot) + 1, 99);
    else if (digits === 3) num = Math.min(Math.floor(Math.random() * maxForThisSlot) + 1, 999);
    else if (digits === 4) num = Math.min(Math.floor(Math.random() * maxForThisSlot) + 1, 9999);
    else if (digits === 5) num = Math.min(Math.floor(Math.random() * maxForThisSlot) + 1, 99999);
    else if (digits === 6) num = Math.min(Math.floor(Math.random() * maxForThisSlot) + 1, 999999);
    
    num = Math.max(1, num); // Ensure at least 1
    nums.push(num);
    remaining -= num;
  }
  
  return nums;
};

const checkSubtractionAnswer = () => {
  // Calculate by subtracting all numbers from the first
  const result = subtractionNumbers.reduce((acc, num, index) => {
    return index === 0 ? num : acc - num;
  }, 0);
  
  const correct = parseInt(userAnswer) === result;
  const score = correct ? 2 : -1;
  
  setResult({ 
    correct, 
    actualAnswer: result.toString(), 
    score 
  });
  
  updatePerformanceData(correct, score);
  setAppState('result');
};

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

// 2. REPLACE startAdditionIntervalDisplay function
const startAdditionIntervalDisplay = (nums) => {
  let currentIdx = 0;
  setAdditionCurrentIndex(0);
  setAdditionCurrentTimer(speed); // Set initial timer display
  
  // Timer countdown for display
  const timerInterval = setInterval(() => {
    setAdditionCurrentTimer(prev => {
      if (prev <= 1) {
        return speed; // Reset to speed when reaching 0
      }
      return prev - 1;
    });
  }, 1000);
  
  // Play beep for first number
  playBeep('normal');
  
  const interval = setInterval(() => {
    if (currentIdx < nums.length - 1) {
      currentIdx++;
      setAdditionCurrentIndex(currentIdx);
      setAdditionCurrentTimer(speed); // Reset timer for new number
      playBeep('normal');
    } else {
      // All numbers shown, now show input
      clearInterval(interval);
      clearInterval(timerInterval);
      setAdditionShowingNumbers(false);
      setShowAdditionAnswer(true);
    }
  }, speed * 1000);
  
  setGameIntervalTimer(interval);
};

// 3. REPLACE startSubtractionIntervalDisplay function
const startSubtractionIntervalDisplay = (nums) => {
  let currentIdx = 0;
  setSubtractionCurrentIndex(0);
  setSubtractionCurrentTimer(speed); // Set initial timer display
  
  // Timer countdown for display
  const timerInterval = setInterval(() => {
    setSubtractionCurrentTimer(prev => {
      if (prev <= 1) {
        return speed;
      }
      return prev - 1;
    });
  }, 1000);
  
  playBeep('normal');
  
  const interval = setInterval(() => {
    if (currentIdx < nums.length - 1) {
      currentIdx++;
      setSubtractionCurrentIndex(currentIdx);
      setSubtractionCurrentTimer(speed); // Reset timer for new number
      playBeep('normal');
    } else {
      clearInterval(interval);
      clearInterval(timerInterval);
      setSubtractionShowingNumbers(false);
      setShowSubtractionAnswer(true);
    }
  }, speed * 1000);
  
  setGameIntervalTimer(interval);
};

// 4. REPLACE generateMixedMathPairs to generate numbers with operations
// const generateMixedMathNumbers = () => {
//   const numbers = [];
//   const digit1 = firstDigit || 1;
  
//   for (let i = 0; i < count; i++) {
//     let num;
    
//     // Generate number based on firstDigit
//     if (digit1 === 1) num = Math.floor(Math.random() * 9) + 1;
//     else if (digit1 === 2) num = Math.floor(Math.random() * 90) + 10;
//     else if (digit1 === 3) num = Math.floor(Math.random() * 900) + 100;
//     else if (digit1 === 4) num = Math.floor(Math.random() * 9000) + 1000;
//     else if (digit1 === 5) num = Math.floor(Math.random() * 90000) + 10000;
//     else if (digit1 === 6) num = Math.floor(Math.random() * 900000) + 100000;
    
//     // 50% chance to be negative (subtraction)
//     const isNegative = Math.random() < 0.5;
    
//     numbers.push({
//       value: num,
//       operation: isNegative ? 'subtract' : 'add'
//     });
//   }
  
//   // Ensure first number is always positive to avoid negative results
//   numbers[0].operation = 'add';
  
//   // Check if result would be negative, if so, adjust
//   let runningSum = 0;
//   for (let i = 0; i < numbers.length; i++) {
//     if (numbers[i].operation === 'add') {
//       runningSum += numbers[i].value;
//     } else {
//       runningSum -= numbers[i].value;
//     }
    
//     // If result becomes negative, change this number to addition
//     if (runningSum < 0) {
//       numbers[i].operation = 'add';
//       runningSum += 2 * numbers[i].value; // Add back twice to correct
//     }
//   }
  
//   return numbers;
// };

const generateMixedMathNumbers = () => {
  const numbers = [];
  const digit1 = firstDigit || 1;
  
  // Start with a large positive number to ensure final result stays positive
  let startingNumber;
  if (digit1 === 1) startingNumber = Math.floor(Math.random() * 5) + 5; // 5-9
  else if (digit1 === 2) startingNumber = Math.floor(Math.random() * 50) + 50; // 50-99
  else if (digit1 === 3) startingNumber = Math.floor(Math.random() * 500) + 500; // 500-999
  else if (digit1 === 4) startingNumber = Math.floor(Math.random() * 5000) + 5000;
  else if (digit1 === 5) startingNumber = Math.floor(Math.random() * 50000) + 50000;
  else if (digit1 === 6) startingNumber = Math.floor(Math.random() * 500000) + 500000;
  
  numbers.push({
    value: startingNumber,
    operation: 'add'
  });
  
  let runningSum = startingNumber;
  
  for (let i = 1; i < count; i++) {
    let num;
    
    // Generate number based on firstDigit but smaller to avoid negative results
    if (digit1 === 1) num = Math.floor(Math.random() * 4) + 1; // 1-4
    else if (digit1 === 2) num = Math.floor(Math.random() * 30) + 10; // 10-39
    else if (digit1 === 3) num = Math.floor(Math.random() * 200) + 100; // 100-299
    else if (digit1 === 4) num = Math.floor(Math.random() * 2000) + 1000;
    else if (digit1 === 5) num = Math.floor(Math.random() * 20000) + 10000;
    else if (digit1 === 6) num = Math.floor(Math.random() * 200000) + 100000;
    
    // Randomly choose operation, but ensure it won't make result negative
    const wouldBeNegative = (runningSum - num) < 0;
    const isSubtract = Math.random() < 0.5 && !wouldBeNegative;
    
    const operation = isSubtract ? 'subtract' : 'add';
    
    if (operation === 'add') {
      runningSum += num;
    } else {
      runningSum -= num;
    }
    
    numbers.push({
      value: num,
      operation: operation
    });
  }
  
  console.log(`Generated mixed math numbers (final result: ${runningSum}):`, numbers);
  return numbers;
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



const startGlobalGameTimer = () => {
  const totalGameTime = speed * count * 1000; // Total time = interval per question × number of questions
  console.log(`Starting game: ${speed}s per question × ${count} questions = ${totalGameTime/1000}s total`);
  
  // Clear existing timers
  if (totalGameTimer) clearInterval(totalGameTimer);
  if (beepInterval) clearInterval(beepInterval);
  if (autoSubmitTimer) clearInterval(autoSubmitTimer);
  
  setGameElapsedTime(0);
  setTimeRemaining(totalGameTime);
  setAvailableQuestions(new Set([0])); // Start with only first question available
  
  // Auto-submit timer for when total time is up
  const submitTimer = setTimeout(() => {
    console.log('Total game time up - auto-submitting');
    forceEndGame();
  }, totalGameTime);
  setAutoSubmitTimer(submitTimer);
  
  // Main game timer - updates every 100ms
  const gameTimer = setInterval(() => {
    setGameElapsedTime(prev => {
      const newElapsed = prev + 100;
      const newRemaining = totalGameTime - newElapsed;
      
      // Calculate which questions should be available based on elapsed time
      const intervalMs = speed * 1000;
      const currentIntervalIndex = Math.floor(newElapsed / intervalMs);
      const maxAvailableQuestion = Math.min(currentIntervalIndex, count - 1);
      
      // Update available questions
      const newAvailable = new Set();
      for (let i = 0; i <= maxAvailableQuestion; i++) {
        newAvailable.add(i);
      }
      setAvailableQuestions(newAvailable);
      
      // Beep at interval transitions
      if (newElapsed % intervalMs < 100 && newElapsed > 100) {
        playBeep('normal');
      }
      
      setTimeRemaining(newRemaining);
      
      if (newRemaining <= 0) {
        clearInterval(gameTimer);
        clearTimeout(submitTimer);
        setTotalGameTimer(null);
        setAutoSubmitTimer(null);
        return newElapsed;
      }
      
      return newElapsed;
    });
  }, 100);
  
  setTotalGameTimer(gameTimer);
};
// 18

// const startGlobalGameTimer = () => {
//   const totalGameTime = speed * count * 1000; // Total time = interval per question × number of questions
//   console.log(`Starting game: ${speed}s per question × ${count} questions = ${totalGameTime/1000}s total`);
  
//   // Clear existing timers
//   if (totalGameTimer) clearInterval(totalGameTimer);
//   if (beepInterval) clearInterval(beepInterval);
//   if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
  
//   setGameElapsedTime(0);
//   setTimeRemaining(totalGameTime);
//   setAvailableQuestions(new Set([0])); // Start with only first question available
  
//   // Auto-submit timer for when total time is up - THIS IS THE KEY FIX
//   const submitTimer = setTimeout(() => {
//     console.log('=== TOTAL GAME TIME EXPIRED - AUTO SUBMITTING ===');
    
//     // Clear all timers immediately
//     if (totalGameTimer) {
//       clearInterval(totalGameTimer);
//       setTotalGameTimer(null);
//     }
//     if (beepInterval) {
//       clearInterval(beepInterval);
//       setBeepInterval(null);
//     }
    
//     // Force end the game with current state
//     forceEndGame();
//   }, totalGameTime);
//   setAutoSubmitTimer(submitTimer);
  
//   // Main game timer - updates every 100ms
//   const gameTimer = setInterval(() => {
//     setGameElapsedTime(prev => {
//       const newElapsed = prev + 100;
//       const newRemaining = totalGameTime - newElapsed;
      
//       // Calculate which questions should be available based on elapsed time
//       const intervalMs = speed * 1000;
//       const currentIntervalIndex = Math.floor(newElapsed / intervalMs);
//       const maxAvailableQuestion = Math.min(currentIntervalIndex, count - 1);
      
//       // Update available questions
//       const newAvailable = new Set();
//       for (let i = 0; i <= maxAvailableQuestion; i++) {
//         newAvailable.add(i);
//       }
//       setAvailableQuestions(newAvailable);
      
//       // Beep at interval transitions
//       if (newElapsed % intervalMs < 100 && newElapsed > 100) {
//         playBeep('normal');
//       }
      
//       setTimeRemaining(newRemaining);
      
//       // Check if time is up
//       if (newRemaining <= 0) {
//         console.log('Game timer reached zero - clearing interval');
//         clearInterval(gameTimer);
//         setTotalGameTimer(null);
        
//         // Don't call forceEndGame here since setTimeout will handle it
//         return newElapsed;
//       }
      
//       return newElapsed;
//     });
//   }, 100);
  
//   setTotalGameTimer(gameTimer);
//   console.log('Global game timer started successfully');
// };


// 4. NEW FUNCTION: Force end game when total time is up
// const forceEndGame = () => {
//   console.log('Force ending game - collecting all answers');
  
//   // Add current answer to the list
//   const finalAnswers = [...questionAnswers];
//   if (currentQuestionAnswer.trim()) {
//     finalAnswers[currentQuestionIndex] = currentQuestionAnswer.trim();
//   }
  
//   // Fill remaining answers with empty strings
//   while (finalAnswers.length < comparisonPairs.length) {
//     finalAnswers.push('');
//   }
  
//   console.log('Final answers submitted:', finalAnswers);
//   checkAllAnswers(finalAnswers);
// };
// 18

const forceEndGame = () => {
  console.log('=== FORCE ENDING GAME - ENHANCED VERSION ===');
  
  // Validation checks
  if (!comparisonPairs || comparisonPairs.length === 0) {
    console.error('No comparison pairs available - cannot end game properly');
    alert('Game data is missing. Returning to setup.');
    setAppState('setup');
    return;
  }
  
  console.log('Current state snapshot:', {
    currentQuestionIndex,
    currentQuestionAnswer,
    questionAnswers: [...questionAnswers],
    comparisonPairsLength: comparisonPairs.length,
    timeRemaining,
    gameElapsedTime
  });
  
  // Collect all answers with current answer
  const finalAnswers = [...questionAnswers];
  
  // Add current answer if valid
  if (currentQuestionIndex >= 0 && 
      currentQuestionIndex < comparisonPairs.length) {
    const currentAnswer = (currentQuestionAnswer || '').toString().trim();
    finalAnswers[currentQuestionIndex] = currentAnswer;
    console.log(`Added current answer "${currentAnswer}" for question ${currentQuestionIndex + 1}`);
  }
  
  // Ensure we have exactly the right number of answers
  while (finalAnswers.length < comparisonPairs.length) {
    finalAnswers.push('');
  }
  
  console.log('Final answers for submission:', finalAnswers);
  
  // Clear all timers immediately
  [totalGameTimer, beepInterval, autoSubmitTimer, questionTimer, gameIntervalTimer].forEach(timer => {
    if (timer) {
      clearInterval(timer);
      clearTimeout(timer);
    }
  });
  
  // Reset timer states
  setTotalGameTimer(null);
  setBeepInterval(null);
  setAutoSubmitTimer(null);
  setQuestionTimer(null);
  setGameIntervalTimer(null);
  setTimeRemaining(0);
  
  // Process results with error handling
  setTimeout(() => {
    try {
      checkAllAnswers(finalAnswers);
    } catch (error) {
      console.error('Error in forceEndGame -> checkAllAnswers:', error);
      alert('Error processing results. Please try again.');
      setAppState('setup');
    }
  }, 200);
};


// FIX 2: REPLACE your forceEndGame function with this enhanced version
// const forceEndGame = () => {
//   console.log('=== FORCE ENDING GAME - ENHANCED VERSION ===');
//   console.log('Current state:', {
//     currentQuestionIndex,
//     currentQuestionAnswer,
//     questionAnswers,
//     comparisonPairsLength: comparisonPairs.length,
//     appState
//   });
  
//   // Ensure we have the comparison pairs data
//   if (!comparisonPairs || comparisonPairs.length === 0) {
//     console.error('No comparison pairs available for force end');
//     // Fallback to setup if no game data
//     setAppState('setup');
//     return;
//   }
  
//   // Collect all answers including current one
//   const finalAnswers = [...questionAnswers];
  
//   // Add current answer if it exists and we're on a valid question
//   if (currentQuestionIndex >= 0 && 
//       currentQuestionIndex < comparisonPairs.length && 
//       currentQuestionAnswer && 
//       currentQuestionAnswer.trim()) {
//     finalAnswers[currentQuestionIndex] = currentQuestionAnswer.trim();
//     console.log(`Added current answer "${currentQuestionAnswer.trim()}" for question ${currentQuestionIndex + 1}`);
//   }
  
//   // Fill remaining answers with empty strings
//   while (finalAnswers.length < comparisonPairs.length) {
//     finalAnswers.push('');
//   }
  
//   console.log('Final answers for submission:', finalAnswers);
//   console.log('Total questions expected:', comparisonPairs.length);
  
//   // Clear ALL timers immediately to prevent any interference
//   const timersToGlear = [
//     totalGameTimer, beepInterval, autoSubmitTimer, 
//     questionTimer, gameIntervalTimer
//   ];
  
//   timersToGlear.forEach(timer => {
//     if (timer) {
//       clearInterval(timer);
//       clearTimeout(timer);
//     }
//   });
  
//   // Reset timer states
//   setTotalGameTimer(null);
//   setBeepInterval(null);
//   setAutoSubmitTimer(null);
//   setQuestionTimer(null);
//   setGameIntervalTimer(null);
  
//   // Ensure we're in a stable state before checking answers
//   setTimeRemaining(0);
  
//   // Use setTimeout to ensure all state updates complete before checking answers
//   setTimeout(() => {
//     console.log('Checking answers after timeout');
//     try {
//       checkAllAnswers(finalAnswers);
//     } catch (error) {
//       console.error('Error in checkAllAnswers:', error);
//       // Fallback to setup on error
//       setAppState('setup');
//       alert('An error occurred while processing results. Please try again.');
//     }
//   }, 200); // Increased timeout to ensure state stability
// };



// const generateSubtractionPairs = () => {
//   const pairs = [];
//   const digit1 = firstDigit || 1;
//   const digit2 = secondDigit || 1;
  
//   for (let i = 0; i < count; i++) {
//     let num1, num2;
    
//     // Generate first number based on firstDigit
//     if (digit1 === 1) num1 = Math.floor(Math.random() * 9) + 1;
//     else if (digit1 === 2) num1 = Math.floor(Math.random() * 90) + 10;
//     else if (digit1 === 3) num1 = Math.floor(Math.random() * 900) + 100;
//     else if (digit1 === 4) num1 = Math.floor(Math.random() * 9000) + 1000;
//     else if (digit1 === 5) num1 = Math.floor(Math.random() * 90000) + 10000;
//     else if (digit1 === 6) num1 = Math.floor(Math.random() * 900000) + 100000;
    
//     // Generate second number based on secondDigit
//     if (digit2 === 1) num2 = Math.floor(Math.random() * 9) + 1;
//     else if (digit2 === 2) num2 = Math.floor(Math.random() * 90) + 10;
//     else if (digit2 === 3) num2 = Math.floor(Math.random() * 900) + 100;
//     else if (digit2 === 4) num2 = Math.floor(Math.random() * 9000) + 1000;
//     else if (digit2 === 5) num2 = Math.floor(Math.random() * 90000) + 10000;
//     else if (digit2 === 6) num2 = Math.floor(Math.random() * 900000) + 100000;
    
//     // Ensure positive result
//     if (num2 > num1) [num1, num2] = [num2, num1];
    
//     pairs.push([num1, num2]);
//   }
//   return pairs;
// };

const generateSubtractionPairs = () => {
  const pairs = [];
  const digit1 = firstDigit || 1;
  const digit2 = secondDigit || 1;
  
  for (let i = 0; i < count; i++) {
    let num1, num2;
    
    // Generate second number (smaller) first based on secondDigit
    if (digit2 === 1) num2 = Math.floor(Math.random() * 9) + 1;
    else if (digit2 === 2) num2 = Math.floor(Math.random() * 90) + 10;
    else if (digit2 === 3) num2 = Math.floor(Math.random() * 900) + 100;
    else if (digit2 === 4) num2 = Math.floor(Math.random() * 9000) + 1000;
    else if (digit2 === 5) num2 = Math.floor(Math.random() * 90000) + 10000;
    else if (digit2 === 6) num2 = Math.floor(Math.random() * 900000) + 100000;
    
    // Generate first number (larger) to ensure positive result
    let minFirst = num2 + 1; // At least 1 more than second number
    let maxFirst;
    
    if (digit1 === 1) maxFirst = 9;
    else if (digit1 === 2) maxFirst = 99;
    else if (digit1 === 3) maxFirst = 999;
    else if (digit1 === 4) maxFirst = 9999;
    else if (digit1 === 5) maxFirst = 99999;
    else if (digit1 === 6) maxFirst = 999999;
    
    // Ensure minFirst doesn't exceed maxFirst
    if (minFirst > maxFirst) {
      // If second number is too big, regenerate a smaller one
      if (digit2 === 1) num2 = Math.floor(Math.random() * Math.min(8, maxFirst - 1)) + 1;
      else if (digit2 === 2) num2 = Math.floor(Math.random() * Math.min(89, maxFirst - 1)) + 10;
      else if (digit2 === 3) num2 = Math.floor(Math.random() * Math.min(899, maxFirst - 1)) + 100;
      else num2 = Math.floor(maxFirst * 0.8); // 80% of max for safety
      
      minFirst = num2 + 1;
    }
    
    num1 = Math.floor(Math.random() * (maxFirst - minFirst + 1)) + minFirst;
    
    pairs.push([num1, num2]);
  }
  
  console.log(`Generated ${pairs.length} subtraction pairs (all positive results):`, pairs);
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
    //    case 'addition':
    //   generatedNumbers = generateNumbers();
    //   setAdditionNumbers(generatedNumbers);
    //   setAdditionCurrentIndex(0);
    //   setAdditionShowingNumbers(true);
      
    //   const totalAdditionTime = speed * 1000; // Total time in ms
    //   setAdditionIndividualTimer(Math.floor(totalAdditionTime / count));
    //   setAdditionTimeRemaining(totalAdditionTime);
    //   setShowAdditionAnswer(false);
    //   setUserAnswer('');
    //   setAppState('game');
      
    //   startAdditionTimer();
    //   startAdditionSequentialDisplay(generatedNumbers, Math.floor(totalAdditionTime / count));
    //   return;
     case 'addition':
      generatedNumbers = generateNumbers();
      setAdditionNumbers(generatedNumbers);
      setAdditionCurrentIndex(0);
      setAdditionShowingNumbers(true);
      
      setShowAdditionAnswer(false);
      setUserAnswer('');
      setAppState('game');
      
      startAdditionIntervalDisplay(generatedNumbers);
      return;
      
case 'subtraction':
  // Use the new subtraction number generation
  generatedNumbers = generateSubtractionNumbers();
  setSubtractionNumbers(generatedNumbers);
  setSubtractionCurrentIndex(0);
  setSubtractionShowingNumbers(true);
  
  setShowSubtractionAnswer(false);
  setUserAnswer('');
  setAppState('game');
  
  startSubtractionIntervalDisplay(generatedNumbers);
  return;

  case 'multiplication':
    case 'division':
    console.log(`Starting ${gameType}: ${count} questions, ${speed}s per question`);
    
    // Generate pairs based on game type
    if (gameType === 'subtraction') pairs = generateSubtractionPairs();
    else if (gameType === 'multiplication') pairs = generateMultiplicationPairs();
    else if (gameType === 'division') pairs = generateDivisionPairs();
    else if (gameType === 'mixedMath') pairs = generateMixedMathPairs();
    
    setComparisonPairs(pairs);
    setCurrentQuestionIndex(0);
    setQuestionAnswers(Array(count).fill(''));
    setCurrentQuestionAnswer('');
    
    setAppState('game');
    startGlobalGameTimer();
    return;

 case 'mixedMath':
  const mixedNumbers = generateMixedMathNumbers();
  setAdditionNumbers(mixedNumbers); // Store mixed numbers in additionNumbers
  setAdditionCurrentIndex(0);
  setAdditionShowingNumbers(true);
  
  setShowAdditionAnswer(false);
  setUserAnswer('');
  setAppState('game');
  
  startMixedMathDisplay(mixedNumbers);
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

// 6. REPLACE startMixedMathDisplay function
const startMixedMathDisplay = (mixedNumbers) => {
  let currentIdx = 0;
  setAdditionCurrentIndex(0);
  setMixedMathTimer(speed);
  
  // Timer countdown for display
  const timerInterval = setInterval(() => {
    setMixedMathTimer(prev => {
      if (prev <= 1) {
        return speed;
      }
      return prev - 1;
    });
  }, 1000);
  
  playBeep('normal');
  
  const interval = setInterval(() => {
    if (currentIdx < mixedNumbers.length - 1) {
      currentIdx++;
      setAdditionCurrentIndex(currentIdx);
      setMixedMathTimer(speed); // Reset timer for new number
      playBeep('normal');
    } else {
      // All numbers shown, now show input
      clearInterval(interval);
      clearInterval(timerInterval);
      setAdditionShowingNumbers(false);
      setShowAdditionAnswer(true);
    }
  }, speed * 1000);
  
  setGameIntervalTimer(interval);
};

// 7. REPLACE checkMixedMathAnswer function
const checkMixedMathAnswer = () => {
  // Calculate result from mixed math numbers
  let result = 0;
  
  for (let i = 0; i < additionNumbers.length; i++) {
    const numData = additionNumbers[i];
    if (numData.operation === 'add') {
      result += numData.value;
    } else {
      result -= numData.value;
    }
  }
  
  const correct = parseInt(userAnswer) === result;
  const score = correct ? 2 : -1;
  
  setResult({ 
    correct, 
    actualAnswer: result.toString(), 
    score 
  });
  
  updatePerformanceData(correct, score);
  setAppState('result');
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
  console.log(`=== SUBMITTING QUESTION ${currentQuestionIndex + 1} ===`);
  console.log(`Current answer: "${currentQuestionAnswer}"`);
  
  // Validation
  if (currentQuestionIndex < 0 || currentQuestionIndex >= comparisonPairs.length) {
    console.error('Invalid question index:', currentQuestionIndex);
    return;
  }
  
  // Update answers array
  const newAnswers = [...questionAnswers];
  newAnswers[currentQuestionIndex] = (currentQuestionAnswer || '').toString().trim();
  setQuestionAnswers(newAnswers);
  
  console.log('Updated answers array:', newAnswers);
  
  // Check if more questions available
  if (currentQuestionIndex < comparisonPairs.length - 1) {
    console.log(`Moving to question ${currentQuestionIndex + 2}`);
    
    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    
    // Load existing answer for next question
    setCurrentQuestionAnswer(newAnswers[nextIndex] || '');
    
  } else {
    // All questions completed
    console.log('All questions completed manually!');
    
    // Clear global timer
    if (totalGameTimer) {
      clearInterval(totalGameTimer);
      setTotalGameTimer(null);
    }
    if (beepInterval) {
      clearInterval(beepInterval);
      setBeepInterval(null);
    }
    
    // Process final results
    setTimeout(() => {
      try {
        checkAllAnswers(newAnswers);
      } catch (error) {
        console.error('Error in manual completion:', error);
        alert('Error processing results. Please try again.');
        setAppState('setup');
      }
    }, 100);
  }
};


// Allow keyboard typing as well (digits + optional leading minus)
const handleKeyboardInput = (e) => {
  const raw = e.target.value;
  // Keep digits and a single leading '-'
  const sanitized = raw.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '');
  setCurrentQuestionAnswer(sanitized);
};

const navigateToQuestion = (questionIndex) => {
  if (availableQuestions.has(questionIndex)) {
    // Save current answer first
    const newAnswers = [...questionAnswers];
    newAnswers[currentQuestionIndex] = currentQuestionAnswer.trim();
    setQuestionAnswers(newAnswers);
    
    // Navigate to new question
    setCurrentQuestionIndex(questionIndex);
    setCurrentQuestionAnswer(newAnswers[questionIndex] || '');
  }
};

// const checkAllAnswers = (answers) => {
//   let correctCount = 0;
//   let actualAnswers = [];
  
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
//       case 'mixedMath':
//   actualAnswers = comparisonPairs.map(([a, b, operation]) => {
//     const result = operation === 'addition' ? a + b : a - b;
//     return result.toString();
//   });
//   correctCount = answers.filter((ans, idx) => 
//     idx < actualAnswers.length && ans === actualAnswers[idx]
//   ).length;
//   break;
//   }
  
//   const accuracy = correctCount / expectedCount;
//   const isCorrect = accuracy >= 0.8; // 80% threshold
//   const score = isCorrect ? 2 : -1; // +2 if 80%+ correct, -1 if below
  
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

// const checkAllAnswers = (answers) => {
//   let correctCount = 0;
//   let actualAnswers = [];
  
//   const expectedCount = comparisonPairs.length;
  
//   switch(gameType) {
//     case 'subtraction':
//       actualAnswers = comparisonPairs.map(([a, b]) => (a - b).toString());
//       break;
      
//     case 'multiplication':
//       actualAnswers = comparisonPairs.map(([a, b]) => (a * b).toString());
//       break;
      
//     case 'division':
//       actualAnswers = comparisonPairs.map(([a, b]) => Math.round(a / b).toString()); // Round for cleaner results
//       break;
      
//     case 'mixedMath':
//       actualAnswers = comparisonPairs.map(([a, b, operation]) => {
//         const result = operation === 'addition' ? a + b : a - b;
//         return result.toString();
//       });
//       break;
//   }
  
//   // Compare user answers with correct answers
//   correctCount = answers.filter((userAns, idx) => {
//     const trimmedUserAns = (userAns || '').toString().trim();
//     const correctAns = actualAnswers[idx] || '';
//     return trimmedUserAns === correctAns;
//   }).length;
  
//   const accuracy = correctCount / expectedCount;
//   const isCorrect = accuracy >= 0.8; // 80% threshold
//   const score = isCorrect ? 2 : -1;
  
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

// const checkAllAnswers = (answers) => {
//   let correctCount = 0;
//   let actualAnswers = [];
  
//   const expectedCount = comparisonPairs.length;
  
//   switch(gameType) {
//     case 'subtraction':
//       actualAnswers = comparisonPairs.map(([a, b]) => {
//         const result = a - b;
//         console.log(`Subtraction: ${a} - ${b} = ${result}`);
//         return result.toString();
//       });
//       break;
      
//     case 'multiplication':
//       actualAnswers = comparisonPairs.map(([a, b]) => {
//         const result = a * b;
//         console.log(`Multiplication: ${a} × ${b} = ${result}`);
//         return result.toString();
//       });
//       break;
      
//     case 'division':
//       actualAnswers = comparisonPairs.map(([a, b]) => {
//         const result = Math.round(a / b);
//         console.log(`Division: ${a} ÷ ${b} = ${result}`);
//         return result.toString();
//       });
//       break;
      
//     case 'mixedMath':
//       actualAnswers = comparisonPairs.map(([a, b, operation]) => {
//         const result = operation === 'addition' ? a + b : a - b;
//         console.log(`Mixed: ${a} ${operation === 'addition' ? '+' : '-'} ${b} = ${result}`);
//         return result.toString();
//       });
//       break;
//   }
  
//   // Debug logging
//   console.log('User answers:', answers);
//   console.log('Correct answers:', actualAnswers);
  
//   // Compare user answers with correct answers (exact string match)
//   correctCount = answers.filter((userAns, idx) => {
//     const trimmedUserAns = (userAns || '').toString().trim();
//     const correctAns = (actualAnswers[idx] || '').toString().trim();
//     const isMatch = trimmedUserAns === correctAns;
    
//     console.log(`Question ${idx + 1}: User="${trimmedUserAns}" vs Correct="${correctAns}" = ${isMatch}`);
    
//     return isMatch;
//   }).length;
  
//   const accuracy = correctCount / expectedCount;
//   const isCorrect = accuracy >= 0.8;
//   const score = isCorrect ? 2 : -1;
  
//   console.log(`Final: ${correctCount}/${expectedCount} correct, accuracy: ${accuracy}`);
  
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
// 18

// const checkAllAnswers = (answers) => {
//   console.log('=== CHECKING ALL ANSWERS ===');
//   console.log('Game type:', gameType);
//   console.log('User answers:', answers);
//   console.log('Comparison pairs:', comparisonPairs);
  
//   let correctCount = 0;
//   let actualAnswers = [];
  
//   const expectedCount = comparisonPairs.length;
  
//   // Clear all timers immediately to prevent interference
//   if (totalGameTimer) {
//     clearInterval(totalGameTimer);
//     setTotalGameTimer(null);
//   }
//   if (beepInterval) {
//     clearInterval(beepInterval);
//     setBeepInterval(null);
//   }
//   if (autoSubmitTimer) {
//     clearInterval(autoSubmitTimer);
//     setAutoSubmitTimer(null);
//   }
//   if (questionTimer) {
//     clearInterval(questionTimer);
//     setQuestionTimer(null);
//   }
  
//   // Calculate correct answers based on game type
//   switch(gameType) {
//     case 'subtraction':
//       actualAnswers = comparisonPairs.map(([a, b]) => {
//         const result = a - b;
//         console.log(`Subtraction: ${a} - ${b} = ${result}`);
//         return result.toString();
//       });
//       break;
      
//     case 'multiplication':
//       actualAnswers = comparisonPairs.map(([a, b]) => {
//         const result = a * b;
//         console.log(`Multiplication: ${a} × ${b} = ${result}`);
//         return result.toString();
//       });
//       break;
      
//     case 'division':
//       actualAnswers = comparisonPairs.map(([a, b]) => {
//         const result = Math.round(a / b);
//         console.log(`Division: ${a} ÷ ${b} = ${result}`);
//         return result.toString();
//       });
//       break;
      
//     case 'mixedMath':
//       actualAnswers = comparisonPairs.map(([a, b, operation]) => {
//         const result = operation === 'addition' ? a + b : a - b;
//         console.log(`Mixed: ${a} ${operation === 'addition' ? '+' : '-'} ${b} = ${result}`);
//         return result.toString();
//       });
//       break;
      
//     default:
//       console.error('Unknown game type for checkAllAnswers:', gameType);
//       actualAnswers = comparisonPairs.map(() => '0');
//   }
  
//   // Compare answers - ensure we have exactly the right number of answers
//   const normalizedAnswers = [...answers];
//   while (normalizedAnswers.length < expectedCount) {
//     normalizedAnswers.push('');
//   }
  
//   // Count correct answers
//   correctCount = normalizedAnswers.filter((userAns, idx) => {
//     const trimmedUserAns = (userAns || '').toString().trim();
//     const correctAns = (actualAnswers[idx] || '').toString().trim();
//     const isMatch = trimmedUserAns === correctAns;
    
//     console.log(`Question ${idx + 1}: User="${trimmedUserAns}" vs Correct="${correctAns}" = ${isMatch}`);
    
//     return isMatch;
//   }).length;
  
//   const accuracy = correctCount / expectedCount;
//   const isCorrect = accuracy >= 0.8;
//   const score = isCorrect ? 2 : -1;
  
//   console.log(`Final: ${correctCount}/${expectedCount} correct, accuracy: ${accuracy.toFixed(2)}`);
  
//   // Create stable result object
//   const resultData = {
//     correct: isCorrect,
//     actualAnswer: `${correctCount}/${expectedCount} correct`,
//     score: score,
//     userAnswers: normalizedAnswers,
//     correctAnswers: actualAnswers,
//     accuracy: (accuracy * 100).toFixed(1) + '%',
//     gameType: gameType,
//     totalQuestions: expectedCount,
//     correctCount: correctCount
//   };
  
//   console.log('Setting result data:', resultData);
  
//   // Set result and immediately change to result state
//   setResult(resultData);
//   updatePerformanceData(isCorrect, score);
  
//   // Force state change after a brief delay to ensure result is set
//   setTimeout(() => {
//     console.log('Changing to result state');
//     setAppState('result');
//   }, 100);
// };

const checkAllAnswers = (answers) => {
  console.log('=== CHECKING ALL ANSWERS - FIXED VERSION ===');
  console.log('Game type:', gameType);
  console.log('User answers (raw):', answers);
  console.log('Comparison pairs:', comparisonPairs);
  
  let correctCount = 0;
  let actualAnswers = [];
  
  const expectedCount = comparisonPairs.length;
  
  // Ensure we have valid comparison pairs
  if (!comparisonPairs || comparisonPairs.length === 0) {
    console.error('No comparison pairs available');
    setAppState('setup');
    return;
  }
  
  // Clear all timers immediately
  const timersToGlear = [
    totalGameTimer, beepInterval, autoSubmitTimer, 
    questionTimer, gameIntervalTimer
  ];
  
  timersToGlear.forEach(timer => {
    if (timer) {
      clearInterval(timer);
      clearTimeout(timer);
    }
  });
  
  // Reset timer states
  setTotalGameTimer(null);
  setBeepInterval(null);
  setAutoSubmitTimer(null);
  setQuestionTimer(null);
  setGameIntervalTimer(null);
  
  // Calculate correct answers based on game type
  try {
    switch(gameType) {
      case 'subtraction':
        actualAnswers = comparisonPairs.map(([a, b], index) => {
          const result = a - b;
          console.log(`Question ${index + 1}: ${a} - ${b} = ${result}`);
          return result.toString();
        });
        break;
        
      case 'multiplication':
        actualAnswers = comparisonPairs.map(([a, b], index) => {
          const result = a * b;
          console.log(`Question ${index + 1}: ${a} × ${b} = ${result}`);
          return result.toString();
        });
        break;
        
      case 'division':
        actualAnswers = comparisonPairs.map(([a, b], index) => {
          const result = Math.round(a / b);
          console.log(`Question ${index + 1}: ${a} ÷ ${b} = ${result}`);
          return result.toString();
        });
        break;
        
      case 'mixedMath':
        actualAnswers = comparisonPairs.map(([a, b, operation], index) => {
          const result = operation === 'addition' ? a + b : a - b;
          console.log(`Question ${index + 1}: ${a} ${operation === 'addition' ? '+' : '-'} ${b} = ${result}`);
          return result.toString();
        });
        break;
        
      default:
        console.error('Unknown game type for checkAllAnswers:', gameType);
        setAppState('setup');
        return;
    }
  } catch (error) {
    console.error('Error calculating correct answers:', error);
    setAppState('setup');
    return;
  }
  
  // Normalize user answers array
  const normalizedAnswers = [...answers];
  while (normalizedAnswers.length < expectedCount) {
    normalizedAnswers.push('');
  }
  
  console.log('Correct answers calculated:', actualAnswers);
  console.log('Normalized user answers:', normalizedAnswers);
  
  // Compare answers with enhanced logging
  correctCount = normalizedAnswers.filter((userAns, idx) => {
    // Clean both answers - remove all whitespace and normalize
    const cleanUserAns = String(userAns || '').replace(/\s+/g, '').toLowerCase();
    const cleanCorrectAns = String(actualAnswers[idx] || '').replace(/\s+/g, '').toLowerCase();
    
    // For numeric answers, try parsing as numbers
    let isMatch = false;
    
    if (cleanUserAns === '' || cleanCorrectAns === '') {
      isMatch = false;
    } else {
      // Try exact string match first
      isMatch = cleanUserAns === cleanCorrectAns;
      
      // If not exact match, try numeric comparison
      if (!isMatch) {
        const userNum = parseFloat(cleanUserAns);
        const correctNum = parseFloat(cleanCorrectAns);
        
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isMatch = Math.abs(userNum - correctNum) < 0.001; // Allow tiny floating point differences
        }
      }
    }
    
    console.log(`Question ${idx + 1}: "${cleanUserAns}" vs "${cleanCorrectAns}" = ${isMatch ? 'CORRECT' : 'WRONG'}`);
    
    return isMatch;
  }).length;
  
  const accuracy = expectedCount > 0 ? correctCount / expectedCount : 0;
  const isCorrect = accuracy >= 0.8; // 80% threshold
  const score = isCorrect ? 2 : -1;
  
  console.log(`Final Result: ${correctCount}/${expectedCount} correct, accuracy: ${(accuracy * 100).toFixed(1)}%`);
  
  // Create stable result object with all necessary data
  const resultData = {
    correct: isCorrect,
    actualAnswer: `${correctCount}/${expectedCount} correct`,
    score: score,
    userAnswers: normalizedAnswers,
    correctAnswers: actualAnswers,
    accuracy: (accuracy * 100).toFixed(1) + '%',
    gameType: gameType,
    totalQuestions: expectedCount,
    correctCount: correctCount,
    timestamp: Date.now() // Add timestamp to prevent stale results
  };
  
  console.log('Setting final result data:', resultData);
  
  // Update performance data
  updatePerformanceData(isCorrect, score);
  
  // Set result with error handling
  try {
    setResult(resultData);
    
    // Use a longer timeout to ensure state is set properly
    setTimeout(() => {
      console.log('Transitioning to result state');
      setAppState('result');
    }, 300);
    
  } catch (error) {
    console.error('Error setting result:', error);
    alert('Error displaying results. Please try again.');
    setAppState('setup');
  }
};



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
  
//   // Clear question-based game states
//   setCurrentQuestionIndex(0);
//   setQuestionAnswers([]);
//   setCurrentQuestionAnswer('');
//   setTimeRemaining(0);
  
//   // Clear addition game states
//   setAdditionNumbers([]);
//   setAdditionTimeRemaining(0);
//   setShowAdditionAnswer(false);
  
//   // Clear ALL timers - including global timer
//   if (questionTimer) {
//     clearInterval(questionTimer);
//     setQuestionTimer(null);
//   }
//   if (additionTimer) {
//     clearInterval(additionTimer);
//     setAdditionTimer(null);
//   }
//   if (totalGameTimer) {
//     clearInterval(totalGameTimer);
//     setTotalGameTimer(null);
//   }
//   if (beepInterval) {
//     clearInterval(beepInterval);
//     setBeepInterval(null);
//   }
  
//   // Reset global game timer states
//   setTotalGameTime(0);
//   setGameStartTime(null);
  
//   setFirstDigit(1);
//   setSecondDigit(1);
// };
// 18

// const resetGame = () => {
//   console.log('=== RESETTING GAME ===');
  
//   // Clear ALL timers first
//   const timersToGlear = [
//     questionTimer, additionTimer, totalGameTimer, 
//     beepInterval, autoSubmitTimer, gameIntervalTimer
//   ];
  
//   timersToGlear.forEach(timer => {
//     if (timer) {
//       clearInterval(timer);
//       clearTimeout(timer);
//     }
//   });
  
//   // Reset all timer states
//   setQuestionTimer(null);
//   setAdditionTimer(null);
//   setTotalGameTimer(null);
//   setBeepInterval(null);
//   setAutoSubmitTimer(null);
//   setGameIntervalTimer(null);
  
//   // Reset all game states
//   setAppState('setup');
//   setUserAnswer('');
//   setNumbers([]);
//   setCurrentIndex(0);
//   setShowingNumbers(false);
//   setTargetNumber(null);
//   setMissingIndices([]);
//   setSymbols([]);
//   setComparisonPairs([]);
  
//   // Clear question-based game states
//   setCurrentQuestionIndex(0);
//   setQuestionAnswers([]);
//   setCurrentQuestionAnswer('');
//   setTimeRemaining(0);
//   setGameElapsedTime(0);
//   setAvailableQuestions(new Set([0]));
  
//   // Clear addition/subtraction game states
//   setAdditionNumbers([]);
//   setAdditionCurrentIndex(0);
//   setAdditionShowingNumbers(true);
//   setAdditionTimeRemaining(0);
//   setShowAdditionAnswer(false);
//   setAdditionCurrentTimer(0);
  
//   setSubtractionNumbers([]);
//   setSubtractionCurrentIndex(0);
//   setSubtractionShowingNumbers(true);
//   setShowSubtractionAnswer(false);
//   setSubtractionTimeRemaining(0);
//   setSubtractionTimer(null);
//   setSubtractionCurrentTimer(0);
  
//   setMixedMathTimer(0);
  
//   // Reset global game timer states
//   setTotalGameTime(0);
//   setGameStartTime(null);
  
//   // Reset difficulty settings to default
//   setFirstDigit(1);
//   setSecondDigit(1);
  
//   // Clear result - this is crucial
//   setResult({ correct: false, actualAnswer: '', score: 0 });
  
//   console.log('Game reset completed');
// };

const resetGame = () => {
  console.log('=== RESETTING GAME - ENHANCED VERSION ===');
  
  // Clear ALL timers with enhanced cleanup
  const allTimers = [
    questionTimer, additionTimer, totalGameTimer, 
    beepInterval, autoSubmitTimer, gameIntervalTimer,
    subtractionTimer
  ];
  
  allTimers.forEach(timer => {
    if (timer) {
      try {
        clearInterval(timer);
        clearTimeout(timer);
      } catch (e) {
        console.log('Timer cleanup error (non-critical):', e.message);
      }
    }
  });
  
  // Reset all timer states
  setQuestionTimer(null);
  setAdditionTimer(null);
  setTotalGameTimer(null);
  setBeepInterval(null);
  setAutoSubmitTimer(null);
  setGameIntervalTimer(null);
  setSubtractionTimer(null);
  
  // Reset all game states
  setAppState('setup');
  setUserAnswer('');
  setNumbers([]);
  setCurrentIndex(0);
  setShowingNumbers(false);
  setTargetNumber(null);
  setMissingIndices([]);
  setSymbols([]);
  setComparisonPairs([]);
  
  // Clear question-based game states
  setCurrentQuestionIndex(0);
  setQuestionAnswers([]);
  setCurrentQuestionAnswer('');
  setTimeRemaining(0);
  setGameElapsedTime(0);
  setAvailableQuestions(new Set([0]));
  
  // Clear all math game states
  setAdditionNumbers([]);
  setAdditionCurrentIndex(0);
  setAdditionShowingNumbers(true);
  setAdditionTimeRemaining(0);
  setShowAdditionAnswer(false);
  setAdditionCurrentTimer(0);
  
  setSubtractionNumbers([]);
  setSubtractionCurrentIndex(0);
  setSubtractionShowingNumbers(true);
  setShowSubtractionAnswer(false);
  setSubtractionTimeRemaining(0);
  setSubtractionCurrentTimer(0);
  
  setMixedMathTimer(0);
  
  // Reset global timer states
  setTotalGameTime(0);
  setGameStartTime(null);
  
  // Reset difficulty settings
  setFirstDigit(1);
  setSecondDigit(1);
  
  // CRITICAL: Clear result with null check
  setResult(null);
  
  console.log('Game reset completed successfully');
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

  {['multiplication', 'division'].includes(gameType) && (
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

{['subtraction'].includes(gameType) && (
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
      <option value="double">Double Digit (10-99)</option>
      <option value="triple">Triple Digit (100-999)</option>
    </select>
  </div>
)}


{!['multiplication', 'division','subtraction'].includes(gameType) && (
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
// 18

// REPLACE your entire renderGame function with this complete version:


// const renderSetup = () => (
//   <div className='avc-rendersetup'>
//     <div className="avc-page-background">
//       <div className="avc-setup-container">
//         <h1 className="avc-title">
//           Avecus Learning App
//         </h1>

//         <div className="avc-login-section">
//           {renderLoginState()}
//           <button 
//             onClick={() => navigate('/')}
//             className="avc-dashboard-btn"
//           >
//             View Dashboard
//           </button>
//         </div>

//         {error && (
//           <div className="avc-error-banner">
//             <span>{error}</span>
//             <button 
//               className="avc-error-close"
//               onClick={() => setError(null)}
//             >
//               ×
//             </button>
//           </div>
//         )}

//         <div className="avc-space-y-4">
//           <div className="avc-input-group">
//             <label>Challenge Type:</label>
//             <select
//               value={gameType}
//               onChange={(e) => {
//                 const newGameType = e.target.value;
//                 setGameType(newGameType);
                
//                 // Set appropriate defaults for new game type
//                 if (newGameType === 'subtraction') {
//                   setFirstDigit(2); // Default to double digits for subtraction
//                   setSecondDigit(2);
//                   setDifficulty('double');
//                 } else if (!['multiplication', 'division'].includes(newGameType)) {
//                   setFirstDigit(1); // Default to single digits for other games
//                   setSecondDigit(1);
//                   setDifficulty('single');
//                 }
//               }}
//               className="avc-select"
//             >
//               {gameModes.map(mode => (
//                 <option key={mode.value} value={mode.value}>
//                   {mode.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* UPDATED DIFFICULTY SELECTION */}
//           <div className="avc-input-group">
//             {['multiplication', 'division'].includes(gameType) ? (
//               <div>
//                 <label>Number of Digits:</label>
//                 <div className="avc-digit-inputs">
//                   <div className="avc-digit-input-group">
//                     <label>First Number Digits:</label>
//                     <input
//                       type="number"
//                       value={firstDigit === 0 ? '' : firstDigit}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setFirstDigit(val === '' ? '' : Math.max(1, Math.min(6, Number(val))));
//                       }}
//                       onFocus={(e) => e.target.select()}
//                       min="1"
//                       max="6"
//                       className="avc-input avc-digit-input"
//                       placeholder="1-6"
//                     />
//                   </div>
//                   <div className="avc-digit-input-group">
//                     <label>Second Number Digits:</label>
//                     <input
//                       type="number"
//                       value={secondDigit === 0 ? '' : secondDigit}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setSecondDigit(val === '' ? '' : Math.max(1, Math.min(6, Number(val))));
//                       }}
//                       onFocus={(e) => e.target.select()}
//                       min="1"
//                       max="6"
//                       className="avc-input avc-digit-input"
//                       placeholder="1-6"
//                     />
//                   </div>
//                 </div>
//               </div>
//             ) : gameType === 'subtraction' ? (
//               <div>

//                 <label>Difficulty:</label>
//                                 <div className="avc-digit-inputs">
//                   <div className="avc-digit-input-group">
//                 <select
//                   value={firstDigit === 2 ? 'double' : firstDigit === 3 ? 'triple' : 'double'}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     setDifficulty(val);
//                     if (val === 'double') { 
//                       setFirstDigit(2); 
//                       setSecondDigit(2); 
//                     } else if (val === 'triple') { 
//                       setFirstDigit(3); 
//                       setSecondDigit(3); 
//                     }
//                   }}
//                   className="avc-input avc-digit-input"
//                 >
//                   <option value="double">Double Digit (10-99)</option>
//                   <option value="triple">Triple Digit (100-999)</option>
//                 </select>
//                 </div>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <label>Difficulty:</label>
//                                 <div className="avc-digit-inputs">
//                   <div className="avc-digit-input-group">
//                 <select
//                   value={firstDigit === 1 ? 'single' : firstDigit === 2 ? 'double' : 'triple'}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     setDifficulty(val);
//                     if (val === 'single') { 
//                       setFirstDigit(1); 
//                       setSecondDigit(1); 
//                     } else if (val === 'double') { 
//                       setFirstDigit(2); 
//                       setSecondDigit(2); 
//                     } else { 
//                       setFirstDigit(3); 
//                       setSecondDigit(3); 
//                     }
//                   }}
//                   className="avc-input avc-digit-input"
//                 >
//                   <option value="single">Single Digit (1-9)</option>
//                   <option value="double">Double Digit (10-99)</option>
//                   <option value="triple">Triple Digit (100-999)</option>
//                 </select>
//               </div>
//                 </div>                
//               </div>
//             )}
//           </div>

//           <div className="avc-input-group">
//             <label>Time Interval (seconds)</label>
//             <input
//               type="number"
//               value={speed === 0 ? '' : speed}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 setSpeed(val === '' ? '' : Number(val));
//               }}
//               onFocus={(e) => e.target.select()}
//               step="0.1"
//               min="0.1"
//               max="5"
//               className="avc-input"
//               placeholder="Enter speed in seconds"
//             />
//           </div>

//           <div className="avc-input-group">
//             <label>Number Of Questions</label>
//             <input
//               type="number"
//               value={count === 0 ? '' : count}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 setCount(val === '' ? '' : Number(val));
//               }}
//               onFocus={(e) => e.target.select()}
//               min="3"
//               max="20"
//               className="avc-input"
//               placeholder="Enter number count"
//             />
//           </div>

//           <button 
//             onClick={startGame}
//             className="avc-start-btn"
//           >
//             Start Challenge
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// );
const renderGame = () => {

  // For addition game - show numbers one by one, then input
if (gameType === 'addition') {
  if (additionShowingNumbers) {
    return (
      <div className='ask-q'>
        <div className="avc-game-container">
          <div className="addition-instruction">
            <h2>Remember these numbers to add them:</h2>
          </div>
          
          <div className="single-number-display">
            <div className="current-number">
              {additionNumbers[additionCurrentIndex]}
            </div>
          </div>
          
          <div className="addition-progress">
            Number {additionCurrentIndex + 1} of {additionNumbers.length}
          </div>
          
          <div className="time-indicator">
            Next number in: {additionCurrentTimer} seconds
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className='ask-q'>
        <div className="avc-game-container">
          <div className="addition-input-section">
            <h2 className="addition-instruction">Now add all the numbers together:</h2>
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// 9. UPDATE subtraction rendering (replace subtraction section in renderGame)
if (gameType === 'subtraction') {
  if (subtractionShowingNumbers) {
    return (
      <div className='ask-q'>
        <div className="avc-game-container">
          <div className="addition-instruction">
            <h2>Remember these numbers for subtraction:</h2>
          </div>
          
          <div className="single-number-display">
            <div className="current-number">
              -{subtractionNumbers[subtractionCurrentIndex]}
            </div>
          </div>
          
          <div className="addition-progress">
            Number {subtractionCurrentIndex + 1} of {subtractionNumbers.length}
          </div>
          
          <div className="time-indicator">
            Next number in: {subtractionCurrentTimer} seconds
          </div>
          
          {subtractionCurrentIndex === 0 && (
            <div className="instruction-note">
              Start with this number, then subtract all the following numbers
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className='ask-q'>
        <div className="avc-game-container">
          <div className="addition-input-section">
            <h2 className="addition-instruction">Subtract all numbers from the first number:</h2>
            <div className="operation-hint">
              {subtractionNumbers[0]} - {subtractionNumbers.slice(1).join(' - ')} = ?
            </div>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="addition-answer-input"
              placeholder="Enter the result"
              autoFocus
            />
            <div className="addition-buttons">
              <button onClick={checkSubtractionAnswer} className="addition-check-btn">
                Check Answer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// 10. UPDATE mixedMath rendering (replace mixedMath section in renderGame)
if (gameType === 'mixedMath') {
  if (additionShowingNumbers) {
    const currentNum = additionNumbers[additionCurrentIndex];
    return (
      <div className='ask-q'>
        <div className="avc-game-container">
          <div className="addition-instruction">
            <h2>Remember these numbers and their operations:</h2>
          </div>
          
          <div className="single-number-display">
            <div className={`current-number ${currentNum.operation === 'add' ? 'addition-phase' : 'subtraction-phase'}`}>
              {currentNum.operation === 'add' ? '+' : '-'} {currentNum.value}
            </div>
          </div>
          
          <div className="addition-progress">
            Number {additionCurrentIndex + 1} of {additionNumbers.length}
          </div>
          
          <div className="time-indicator">
            Next number in: {mixedMathTimer} seconds
          </div>
          
          <div className="operation-indicator">
            {currentNum.operation === 'add' ? 'ADD this number' : 'SUBTRACT this number'}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className='ask-q'>
        <div className="avc-game-container">
          <div className="addition-input-section">
            <h2 className="addition-instruction">Calculate the final result:</h2>
            <div className="operation-hint">
              {additionNumbers.map((num, index) => 
                `${index === 0 ? '' : ' '}${num.operation === 'add' ? '+' : '-'} ${num.value}`
              ).join('')} = ?
            </div>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="addition-answer-input"
              placeholder="Enter the final result"
              autoFocus
            />
            <div className="addition-buttons">
              <button onClick={checkMixedMathAnswer} className="addition-check-btn">
                Check Answer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


// For math operation games - replace the math operations section:
if (['multiplication', 'division'].includes(gameType)) {
  const currentPair = comparisonPairs[currentQuestionIndex];
  if (!currentPair) return null;
  
  const [a, b] = currentPair;
  let operatorSymbol = '';
  
  switch(gameType) {
    case 'subtraction': operatorSymbol = ' - '; break;
    case 'multiplication': operatorSymbol = ' × '; break;
    case 'division': operatorSymbol = ' ÷ '; break;
    case 'mixedMath':
      const operation = currentPair[2];
      operatorSymbol = operation === 'addition' ? ' + ' : ' - ';
      break;
  }
  
  const intervalMs = speed * 1000;
  const currentInterval = Math.floor(gameElapsedTime / intervalMs);
  const timeInCurrentInterval = gameElapsedTime % intervalMs;
  const timeLeftInInterval = intervalMs - timeInCurrentInterval;
  
  return (
    <div className='ask-q'>
      <div className="avc-game-container">
        <div className="question-timer-bar">
          <div 
            className="timer-progress" 
            style={{ width: `${(timeRemaining / (speed * count * 1000)) * 100}%` }}
          ></div>
        </div>
        
        <div className="question-navigation">
          <div className="question-nav-buttons">
            {comparisonPairs.map((_, index) => (
              <button
                key={index}
                className={`nav-btn ${
                  index === currentQuestionIndex ? 'active' : ''
                } ${
                  availableQuestions.has(index) ? 'available' : 'locked'
                } ${
                  questionAnswers[index]?.trim() ? 'answered' : ''
                }`}
                onClick={() => navigateToQuestion(index)}
                disabled={!availableQuestions.has(index)}
              >
                Q{index + 1}
              </button>
            ))}
          </div>
        </div>
        
        <div className="question-counter">
          Question {currentQuestionIndex + 1} of {comparisonPairs.length}
          {!availableQuestions.has(currentQuestionIndex + 1) && currentQuestionIndex < comparisonPairs.length - 1 && (
            <div className="next-unlock">
              Next question unlocks in: {Math.ceil(timeLeftInInterval / 1000)}s
            </div>
          )}
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
  // ADD THESE ATTRIBUTES TO DISABLE MOBILE KEYBOARD:
  inputMode="none"
  onFocus={(e) => e.target.blur()} // Immediately blur to prevent keyboard
  readOnly={true} // Make it read-only to prevent typing
  onTouchStart={(e) => e.preventDefault()} // Prevent touch events that might trigger keyboard
  style={{ caretColor: 'transparent' }} // Hide cursor
/>
          </div>
          
          <NumberPad />
          
          <div className="total-time-remaining">
            Total time remaining: {Math.ceil(timeRemaining / 1000)}s
          </div>
        </div>
      </div>
    </div>
  );
}
}

// REPLACE your renderResult function with this enhanced version:
// const renderResult = () => {
//   if (!result) return null;

//   return (
//     <div className="avc-result-screen-container">
//       <div className="avc-result-card">
//         <div className="avc-result-header">
//           <h2>Game Result</h2>
//           <div className={`avc-result-message ${result.correct ? 'avc-correct' : 'avc-incorrect'}`}>
//             <span className="avc-emoji">
//               {result.correct ? "Correct! 🎉" : "Not quite right 😕"}
//             </span>
//           </div>
//         </div>

//         <div className="avc-result-details">
//           {/* Show detailed results for math operations */}
//           {['subtraction', 'multiplication', 'division'].includes(gameType) && result.userAnswers && result.correctAnswers ? (
//             <div className="avc-detailed-results">
//               <div className="avc-result-summary">
//                 <span className="avc-detail-label">Overall Result:</span>
//                 <span className="avc-detail-value">{result.actualAnswer}</span>
//                 {result.accuracy && (
//                   <span className="avc-detail-value">Accuracy: {result.accuracy}</span>
//                 )}
//               </div>
              
//               {/* <div className="avc-question-breakdown">
//                 <h3>Question Breakdown:</h3>
//                 {comparisonPairs.map((pair, index) => {
//                   const [a, b] = pair;
//                   const userAns = result.userAnswers[index] || 'No answer';
//                   const correctAns = result.correctAnswers[index];
//                   const isCorrect = userAns === correctAns;
                  
//                   let operation = '';
//                   switch(gameType) {
//                     case 'subtraction': operation = ' - '; break;
//                     case 'multiplication': operation = ' × '; break;
//                     case 'division': operation = ' ÷ '; break;
//                   }
                  
//                   return (
//                     <div key={index} className={`avc-question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
//                       <span className="question">{a}{operation}{b} = </span>
//                       <span className="user-answer">Your: {userAns}</span>
//                       <span className="correct-answer">Correct: {correctAns}</span>
//                       <span className="status">{isCorrect ? '✓' : '✗'}</span>
//                     </div>
//                   );
//                 })}
//               </div> */}

//               <div className="avc-question-breakdown">
//             <h3>Question Breakdown:</h3>
//             {comparisonPairs.map((pair, index) => {
//                 const [a, b] = pair;
//                 const userAns = result.userAnswers[index] || 'No answer';
//                 const correctAns = result.correctAnswers[index];
//                 const isCorrect = userAns === correctAns;
                
//                 let operation = '';
//                 let calculatedResult = '';
                
//                 switch(gameType) {
//                 case 'subtraction': 
//                     operation = ' - '; 
//                     calculatedResult = a - b;
//                     break;
//                 case 'multiplication': 
//                     operation = ' × '; 
//                     calculatedResult = a * b;
//                     break;
//                 case 'division': 
//                     operation = ' ÷ '; 
//                     calculatedResult = Math.round(a / b);
//                     break;
//                 case 'mixedMath':
//                     const op = pair[2];
//                     operation = op === 'addition' ? ' + ' : ' - ';
//                     calculatedResult = op === 'addition' ? a + b : a - b;
//                     break;
//                 }
                
//                 return (
//                 <div key={index} className={`avc-question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
//                     <span className="question">{a}{operation}{b} = {calculatedResult} </span>
//                     <span className="user-answer">Your: {userAns}</span>
//                     <span className="correct-answer">Correct: {correctAns}</span>
//                     <span className="status">{isCorrect ? '✓' : '✗'}</span>
//                 </div>
//                 );
//             })}
//             </div>
//             </div>
//           ) : (
//             // Standard result display for other game types
//             <>
//               <div className="avc-result-detail">
//                 <span className="avc-detail-label">Your Answer: </span>
//                 <span className="avc-detail-value">{userAnswer} </span>
//               </div>
//               <div className="avc-result-detail">
//                 <span className="avc-detail-label">Correct Answer:</span>
//                 <span className="avc-detail-value">{result.actualAnswer}</span>
//               </div>
//             </>
//           )}
          
//           <div className="avc-result-detail">
//             <span className="avc-detail-label">Score:</span>
//             <span className={`avc-detail-value ${result.score > 0 ? 'avc-positive-score' : 'avc-negative-score'}`}>
//               {result.score > 0 ? "+" : ""}{result.score.toFixed(2)}
//               {result.maxScore > 1 && ` of ${result.maxScore}`}
//             </span>
//           </div>
//         </div>

//         <div className="avc-result-actions">
//           <button 
//             onClick={() => {
//               resetGame();
//               startGame();
//             }}
//             className="avc-btn avc-btn-retry"
//           >
//             <span className="avc-emoji">🔄</span>
//             <span>Try Again</span>
//           </button>

//           <button 
//             // onClick={() => navigate('/play')}
//                       onClick={() => {
// resetGame();
//             }}
//             className="avc-btn avc-btn-dashboard"
//           >
//             <span className="avc-emoji">🏠</span>
//             <span>Dashboard</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// 18

const renderResult = () => {
  console.log('=== RENDERING RESULT - ENHANCED VERSION ===');
  console.log('Current result data:', result);
  console.log('Current app state:', appState);
  
  // Enhanced validation
  if (!result) {
    console.log('No result data - showing loading state');
    return (
      <div className="avc-result-screen-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="avc-result-card" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h2>Loading Results...</h2>
          <p>Please wait while we process your answers.</p>
          <button 
            onClick={() => setAppState('setup')}
            style={{
              backgroundColor: '#6c5ce7',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  // Check for stale/invalid result
  if (!result.correctAnswers || !result.userAnswers) {
    console.log('Invalid result data structure');
    return (
      <div className="avc-result-screen-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="avc-result-card" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h2>Error Loading Results</h2>
          <p>There was an error processing your results.</p>
          <button 
            onClick={() => {
              setResult(null);
              setAppState('setup');
            }}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const hasDetailedResults = result.userAnswers && result.correctAnswers && 
                            Array.isArray(result.userAnswers) && Array.isArray(result.correctAnswers);
  
  return (
    <div 
      className="avc-result-screen-container" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="avc-result-card"
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          minWidth: '320px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          padding: '0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 10px 20px',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{
            margin: '0 0 15px 0',
            textAlign: 'center',
            fontSize: '24px',
            color: '#333'
          }}>
            Game Result
          </h2>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: result.correct ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.correct ? '#c3e6cb' : '#f5c6cb'}`,
            color: result.correct ? '#155724' : '#721c24',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {result.correct ? "Excellent Work! 🎉" : "Keep Practicing! 😊"}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Summary */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              {result.actualAnswer}
            </div>
            {result.accuracy && (
              <div style={{ fontSize: '16px', color: '#666' }}>
                Accuracy: {result.accuracy}
              </div>
            )}
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              color: result.score > 0 ? '#28a745' : '#dc3545',
              marginTop: '8px'
            }}>
              Score: {result.score > 0 ? '+' : ''}{result.score}
            </div>
          </div>

          {/* Question Breakdown */}
          {hasDetailedResults && comparisonPairs && comparisonPairs.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>Question Breakdown:</h3>
              <div style={{ 
                maxHeight: '300px', 
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}>
                {comparisonPairs.map((pair, index) => {
                  const [a, b] = pair;
                  const userAnswer = result.userAnswers[index] || 'No answer';
                  const correctAnswer = result.correctAnswers[index];
                  
                  // Clean comparison
                  const cleanUserAns = String(userAnswer).replace(/\s+/g, '').toLowerCase();
                  const cleanCorrectAns = String(correctAnswer).replace(/\s+/g, '').toLowerCase();
                  
                  let isCorrect = false;
                  if (cleanUserAns !== '' && cleanCorrectAns !== '') {
                    isCorrect = cleanUserAns === cleanCorrectAns;
                    
                    // Try numeric comparison if string comparison fails
                    if (!isCorrect) {
                      const userNum = parseFloat(cleanUserAns);
                      const correctNum = parseFloat(cleanCorrectAns);
                      if (!isNaN(userNum) && !isNaN(correctNum)) {
                        isCorrect = Math.abs(userNum - correctNum) < 0.001;
                      }
                    }
                  }
                  
                  let operation = '';
                  let calculatedResult = '';
                  
                  switch(gameType) {
                    case 'subtraction': 
                      operation = ' - '; 
                      calculatedResult = a - b;
                      break;
                    case 'multiplication': 
                      operation = ' × '; 
                      calculatedResult = a * b;
                      break;
                    case 'division': 
                      operation = ' ÷ '; 
                      calculatedResult = Math.round(a / b);
                      break;
                    case 'mixedMath':
                      const op = pair[2];
                      operation = op === 'addition' ? ' + ' : ' - ';
                      calculatedResult = op === 'addition' ? a + b : a - b;
                      break;
                    default:
                      operation = ' ? ';
                      calculatedResult = correctAnswer;
                  }
                  
                  return (
                    <div 
                      key={index} 
                      style={{
                        padding: '12px 16px',
                        borderBottom: index < comparisonPairs.length - 1 ? '1px solid #eee' : 'none',
                        backgroundColor: isCorrect ? '#f8fff9' : '#fff8f8'
                      }}
                    >
                      <div style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '4px',
                        color: '#333'
                      }}>
                        Q{index + 1}: {a}{operation}{b} = {calculatedResult}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>Your: <strong>{userAnswer}</strong></span>
                        <span>Correct: <strong>{correctAnswer}</strong></span>
                        <span style={{ 
                          fontSize: '16px',
                          color: isCorrect ? '#28a745' : '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => {
              console.log('Try Again clicked - resetting game');
              setResult(null);
              resetGame();
              setTimeout(() => {
                startGame();
              }, 100);
            }}
            style={{
              backgroundColor: '#ff8c00',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            <span>🔄</span>
            <span>Try Again</span>
          </button>

          <button 
            onClick={() => {
              console.log('Dashboard clicked - returning to setup');
              setResult(null);
              resetGame();
            }}
            style={{
              backgroundColor: '#6c5ce7',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// const renderResult = () => {
//   console.log('=== RENDERING RESULT ===');
//   console.log('Current result:', result);
//   console.log('Current appState:', appState);
  
//   if (!result) {
//     console.log('No result data available');
//     return (
//       <div className="avc-result-screen-container">
//         <div className="avc-result-card">
//           <div className="avc-result-header">
//             <h2>Loading Results...</h2>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const isDetailedResult = result.userAnswers && result.correctAnswers && comparisonPairs.length > 0;
  
//   return (
//     <div className="avc-result-screen-container" style={{ 
//       position: 'fixed', 
//       top: 0, 
//       left: 0, 
//       right: 0, 
//       bottom: 0, 
//       zIndex: 9999,
//       backgroundColor: 'rgba(0,0,0,0.8)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center'
//     }}>
//       <div className="avc-result-card" style={{
//         backgroundColor: 'white',
//         padding: '20px',
//         borderRadius: '10px',
//         maxWidth: '90vw',
//         maxHeight: '90vh',
//         overflow: 'auto',
//         minWidth: '300px'
//       }}>
//         <div className="avc-result-header">
//           <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Game Result</h2>
//           <div className={`avc-result-message ${result.correct ? 'avc-correct' : 'avc-incorrect'}`}
//                style={{
//                  textAlign: 'center',
//                  padding: '10px',
//                  borderRadius: '5px',
//                  backgroundColor: result.correct ? '#d4edda' : '#f8d7da',
//                  color: result.correct ? '#155724' : '#721c24',
//                  marginBottom: '20px'
//                }}>
//             <span className="avc-emoji">
//               {result.correct ? "Correct! 🎉" : "Not quite right 😕"}
//             </span>
//           </div>
//         </div>

//         <div className="avc-result-details">
//           {/* Show detailed results for math operations */}
//           {isDetailedResult ? (
//             <div className="avc-detailed-results">
//               <div className="avc-result-summary" style={{ marginBottom: '20px' }}>
//                 <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
//                   <span className="avc-detail-label">Overall Result: </span>
//                   <span className="avc-detail-value">{result.actualAnswer}</span>
//                 </div>
//                 {result.accuracy && (
//                   <div style={{ fontSize: '16px', marginBottom: '10px' }}>
//                     <span className="avc-detail-label">Accuracy: </span>
//                     <span className="avc-detail-value">{result.accuracy}</span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="avc-question-breakdown" style={{ marginBottom: '20px' }}>
//                 <h3 style={{ marginBottom: '15px' }}>Question Breakdown:</h3>
//                 <div style={{ maxHeight: '300px', overflow: 'auto' }}>
//                   {comparisonPairs.map((pair, index) => {
//                     const [a, b] = pair;
//                     const userAns = result.userAnswers[index] || 'No answer';
//                     const correctAns = result.correctAnswers[index];
//                     const isCorrect = userAns.toString().trim() === correctAns.toString().trim();
                    
//                     let operation = '';
//                     let calculatedResult = '';
                    
//                     switch(gameType) {
//                       case 'subtraction': 
//                         operation = ' - '; 
//                         calculatedResult = a - b;
//                         break;
//                       case 'multiplication': 
//                         operation = ' × '; 
//                         calculatedResult = a * b;
//                         break;
//                       case 'division': 
//                         operation = ' ÷ '; 
//                         calculatedResult = Math.round(a / b);
//                         break;
//                       case 'mixedMath':
//                         const op = pair[2];
//                         operation = op === 'addition' ? ' + ' : ' - ';
//                         calculatedResult = op === 'addition' ? a + b : a - b;
//                         break;
//                       default:
//                         operation = ' ? ';
//                         calculatedResult = correctAns;
//                     }
                    
//                     return (
//                       <div key={index} 
//                            style={{
//                              padding: '8px 12px',
//                              margin: '5px 0',
//                              borderRadius: '5px',
//                              backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
//                              border: `1px solid ${isCorrect ? '#c3e6cb' : '#f5c6cb'}`
//                            }}>
//                         <div style={{ fontWeight: 'bold' }}>
//                           Q{index + 1}: {a}{operation}{b} = {calculatedResult}
//                         </div>
//                         <div style={{ fontSize: '14px', marginTop: '4px' }}>
//                           <span>Your answer: {userAns} | </span>
//                           <span>Correct: {correctAns} | </span>
//                           <span style={{ fontWeight: 'bold', color: isCorrect ? '#155724' : '#721c24' }}>
//                             {isCorrect ? '✓' : '✗'}
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // Standard result display for other game types
//             <div style={{ marginBottom: '20px' }}>
//               <div style={{ marginBottom: '10px' }}>
//                 <span className="avc-detail-label">Your Answer: </span>
//                 <span className="avc-detail-value">{userAnswer || 'No answer provided'}</span>
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <span className="avc-detail-label">Correct Answer: </span>
//                 <span className="avc-detail-value">{result.actualAnswer}</span>
//               </div>
//             </div>
//           )}
          
//           <div style={{ 
//             padding: '10px',
//             borderRadius: '5px',
//             backgroundColor: '#f8f9fa',
//             textAlign: 'center',
//             marginBottom: '20px'
//           }}>
//             <span className="avc-detail-label">Score: </span>
//             <span style={{
//               fontSize: '18px',
//               fontWeight: 'bold',
//               color: result.score > 0 ? '#28a745' : '#dc3545'
//             }}>
//               {result.score > 0 ? "+" : ""}{result.score}
//               {result.maxScore > 1 && ` of ${result.maxScore}`}
//             </span>
//           </div>
//         </div>

//         <div className="avc-result-actions" style={{ 
//           display: 'flex', 
//           gap: '10px', 
//           justifyContent: 'center',
//           flexWrap: 'wrap'
//         }}>
//           <button 
//             onClick={() => {
//               console.log('Try Again clicked');
//               resetGame();
//               setTimeout(() => {
//                 startGame();
//               }, 100);
//             }}
//             style={{
//               backgroundColor: '#ff8c00',
//               color: 'white',
//               border: 'none',
//               padding: '12px 24px',
//               borderRadius: '5px',
//               fontSize: '16px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}
//           >
//             <span>🔄</span>
//             <span>Try Again</span>
//           </button>

//           <button 
//             onClick={() => {
//               console.log('Dashboard clicked');
//               resetGame();
//             }}
//             style={{
//               backgroundColor: '#6c5ce7',
//               color: 'white',
//               border: 'none',
//               padding: '12px 24px',
//               borderRadius: '5px',
//               fontSize: '16px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}
//           >
//             <span>🏠</span>
//             <span>Dashboard</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
  
  return (
    <div className="app-container">
      {appState === 'setup' && renderSetup()}
      {appState === 'game' && renderGame()}
      {appState === 'result' && renderResult()}
    </div>
  );
};

export default AvecusApp;




// dfjdfjzjhdifzsidh tfideifhysidjv hkjz ddhvxhcpioofuhydfhgsdffvioodznfv;oidfgvnse

// mgvicnbnnd gdfngdnfkjgn kjdfgjkdkjfgjhykhjkhjkkoudhfoigh idf hgidfogdf bjdbfjbbudfbvuijsdnfjbdjkfbndnfbjncivbn

// 4fhg48h694fg6h4f4gh4f46ghghgh198