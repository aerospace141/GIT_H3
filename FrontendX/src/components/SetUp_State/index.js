import React, { useState, useEffect } from 'react';
import "../../styles/SetUp_State/index.css"; // Ensure this path is correct
import axios from 'axios'; // Make sure axios is installed
import { useNavigate } from 'react-router-dom';
import Netflix from "../../components/home/netflix";
import { ThreeDot } from 'react-loading-indicators';

const AvecusApp = () => {
  const navigate = useNavigate();
  // App states (unchanged)
  const [appState, setAppState] = useState('setup');
  const [gameType, setGameType] = useState('memory');
  const [difficulty, setDifficulty] = useState('single');
  const [speed, setSpeed] = useState(0.5);
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



  
  // API configuration
  const API_URL = process.env.REACT_APP_API_BASE_URL;
  
  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Found token, verifying...");
      axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `${token}` }
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

    setIsLoading(true);
    axios.get(`${API_URL}/performance/${uid}`, {
      headers: { Authorization: `${token}` }
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
    
    if (userId) {
      const timerId = setTimeout(() => {
        console.log("Saving to server for user:", userId);
        axios.post(`${API_URL}/performance/${userId}`, performanceData, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem('token')}`
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
  
  const gameModes = [
    { value: 'memory', label: 'Memory Mode' },
    { value: 'addition', label: 'Addition Mode' },
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
  
  const generateNumbers = () => {
    const newNumbers = [];
    for (let i = 0; i < count; i++) {
      if (difficulty === 'single') {
        newNumbers.push(Math.floor(Math.random() * 10));
      } else if (difficulty === 'double') {
        newNumbers.push(Math.floor(Math.random() * 90 + 10));
      } else {
        newNumbers.push(Math.floor(Math.random() * 900 + 100));
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
  
  const startGame = () => {
    let generatedNumbers = [];
    
    switch(gameType) {
      case 'memory':
        generatedNumbers = generateNumbers();
        break;
      case 'addition':
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
    
    showNumbersSequentially(generatedNumbers);
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
  
  const checkAnswer = () => {
    let correct = false;
    let actualAnswer = '';
    let score = 0;
    let maxScore = 1;
    
    switch(gameType) {
      case 'memory':
        actualAnswer = numbers.join('');
        correct = userAnswer === actualAnswer;
        score = correct ? 1 : -0.25;
        break;
      case 'addition':
        actualAnswer = numbers.reduce((sum, num) => sum + num, 0).toString();
        correct = userAnswer === actualAnswer;
        score = correct ? 1 : -0.25;
        break;
      case 'counting':
        actualAnswer = numbers.filter(n => n === targetNumber).length.toString();
        correct = userAnswer === actualAnswer;
        score = correct ? 1 : -0.25;
        break;
      case 'pattern':
        const patternStep = numbers[1] - numbers[0];
        actualAnswer = (numbers[numbers.length - 1] + patternStep).toString();
        correct = userAnswer === actualAnswer;
        score = correct ? 1 : -0.25;
        break;
      case 'reverse':
        actualAnswer = [...numbers].reverse().join('');
        correct = userAnswer === actualAnswer;
        score = correct ? 1 : -0.25;
        break;
      case 'missing':
        const missingNumbers = missingIndices.map(idx => idx + 1).sort((a, b) => a - b).join(',');
        actualAnswer = missingNumbers;
        correct = userAnswer.replace(/\s+/g, '') === missingNumbers;
        score = correct ? 1 : -0.25;
        break;
      case 'oddeven':
        const oddCount = numbers.filter(n => n % 2 !== 0).length;
        const evenCount = numbers.filter(n => n % 2 === 0).length;
        actualAnswer = `Odd: ${oddCount}, Even: ${evenCount}`;
        const userCounts = userAnswer.toLowerCase().split(',');
        const userOdd = parseInt(userCounts[0]?.replace(/\D/g, '') || 0);
        const userEven = parseInt(userCounts[1]?.replace(/\D/g, '') || 0);
        correct = userOdd === oddCount && userEven === evenCount;
        score = correct ? 1 : -0.25;
        break;
      case 'multiples':
        actualAnswer = (targetNumber * (numbers.length + 1)).toString();
        correct = userAnswer === actualAnswer;
        score = correct ? 1 : -0.25;
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
        score = correct ? 1 : -0.25;
        break;
      case 'symbol':
        const associations = userAnswer.replace(/\s+/g, '').split(',');
        const correctAssociations = numbers.map((n, i) => `${symbols[i]}=${n}`).join(',');
        actualAnswer = correctAssociations;
        correct = associations.join('') === numbers.map((n, i) => `${symbols[i]}${n}`).join('');
        score = correct ? 1 : -0.25;
        break;
      default:
        actualAnswer = numbers.join('');
        correct = userAnswer === actualAnswer;
        score = correct ? 1 : -0.25;
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
        difficulty,
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
        return "odd:5, even:7";
      case 'multiples':
        return "Enter next multiple";
      case 'comparison':
        return "Enter >,<,= for each pair (e.g., >,<,=,>)";
      case 'speed':
        return "Enter last number shown";
      case 'symbol':
        return "★=7,♦=3,♣=5,...";
      default:
        return "Enter your answer";
    }
  };
  
  const renderLoginState = () => {
    const token = localStorage.getItem('token');
    
    return (
      <div className="flex items-center">
        {userId ? (
          <div className="text-sm text-green-600 mr-4">
            ✓ Data syncing to account
          </div>
        ) : (
          <a href="/login" className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 text-sm mr-2">
            Login to sync data
          </a>
        )}
      </div>
    );
  };
  
  const renderSetup = () => (
    <div className='Rendersetup'>

    <div className="avecus-page-background">
    <div className="avecus-setup-container">
      <h1 className="avecus-title">
        Avecus Learning App
      </h1>

      <div className="avecus-login-section">
        <div>
          {renderLoginState()}
        </div>
        <button 
          onClick={() => navigate('/')}
          className="avecus-dashboard-btn"
        >
          View Dashboard
        </button>
      </div>

      {error && (
        <div className="avecus-error-banner">
          <span>{error}</span>
          <button 
            className="avecus-error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="avecus-input-group">
          <label>Challenge Type:</label>
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value)}
            className="avecus-select"
          >
            {gameModes.map(mode => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        <div className="avecus-input-group">
          <label>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="avecus-select"
          >
            <option value="single">Single Digit (1-9)</option>
            <option value="double">Double Digit (10-99)</option>
            <option value="triple">Triple Digit (100-999)</option>
          </select>
        </div>

        <div className="avecus-input-group">
          <label>Speed (seconds):</label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            step="0.1"
            min="0.1"
            max="5"
            className="avecus-input"
          />
        </div>

        <div className="avecus-input-group">
          <label>Number Count:</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min="3"
            max="20"
            className="avecus-input"
          />
        </div>

        <button 
          onClick={startGame}
          className="avecus-start-btn"
        >
          Start Challenge
        </button>
      </div>
    </div>
  </div>
</div>
  );
  
  const renderGame = () => (
    <div className="avecus-game-container">
        {showingNumbers ? (
            <div>
                <h2 className="avecus-game-instruction-header">
                    {getInstructionText()}
                </h2>
                <div className="avecus-game-display-container">
                    {getDisplayText()}
                </div>
                <div className="avecus-game-progress-indicator">
                    Showing {currentIndex + 1} of {gameType === 'comparison' ? comparisonPairs.length : numbers.length}
                </div>
            </div>
        ) : (
            <div className="avecus-game-input-container">
                <h2 className="avecus-game-instruction-header">
                    {getInstructionText()}
                </h2>
                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="avecus-game-answer-input"
                    placeholder={getPlaceholderText()}
                    autoFocus
                />
                <button
                    onClick={checkAnswer}
                    className="avecus-game-check-button"
                >
                    Check Answer
                </button>
            </div>
        )}
    </div>
);
  
  // const renderResult = () => (
  //   <div className="result-container text-center">
  //     <h2 className="text-2xl font-bold mb-4">
  //       {result.correct ? "Correct! 🎉" : "Not quite right 😕"}
  //     </h2>
      
  //     <div className="mb-6">
  //       <p className="text-lg">Your answer: <span className="font-bold">{userAnswer}</span></p>
  //       <p className="text-lg">Correct answer: <span className="font-bold">{result.actualAnswer}</span></p>
        
  //       <p className="text-lg mt-2">
  //         Score: {result.score > 0 ? "+" : ""}{result.score.toFixed(2)}
  //         {result.maxScore > 1 && ` of ${result.maxScore}`}
  //       </p>
  //     </div>
      
  //     <div className="flex space-x-4 justify-center">
  //       <button 
  //         onClick={() => {
  //           setAppState('setup');
  //           startGame();
  //         }}
  //         className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
  //       >
  //         Try Again
  //       </button>
        
  //       <button 
  //         onClick={resetGame}
  //         className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
  //       >
  //         Change Mode
  //       </button>
        
  //       <button 
  //         onClick={() => setAppState('dashboard')}
  //         className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
  //       >
  //         Dashboard
  //       </button>
  //     </div>
  //   </div>
  // );
  
  // Main app render
  
  // const renderResult = () => {
  //   return result.correct ? (
  //     <div className="result-message correct">
  //       <span className="emoji">✅</span>
  //       Correct! Great job!
  //     </div>
  //   ) : (
  //     <div className="result-message incorrect">
  //       <span className="emoji">❌</span>
  //       Not quite right
  //     </div>
  //   );
  // };

  // return (
  //   <div className="result-screen-container">
  //     <div className="result-card">
  //       <div className="result-header">
  //         <h2>Game Result</h2>
  //         {renderResult()}
  //       </div>

  //       <div className="result-details">
  //         <div className="result-detail">
  //           <span className="detail-label">Your Answer:</span>
  //           <span className="detail-value">{userAnswer}</span>
  //         </div>
  //         <div className="result-detail">
  //           <span className="detail-label">Correct Answer:</span>
  //           <span className="detail-value">{result.actualAnswer}</span>
  //         </div>
  //         <div className="result-detail">
  //           <span className="detail-label">Score:</span>
  //           <span className={`detail-value ${result.score > 0 ? 'positive-score' : 'negative-score'}`}>
  //             {result.score > 0 ? "+" : ""}{result.score.toFixed(2)}
  //             {result.maxScore > 1 && ` of ${result.maxScore}`}
  //           </span>
  //         </div>
  //       </div>

  //       <div className="result-actions">
  //         <button 

  //           className="btn btn-retry"
  //         >
  //           <span className="emoji">🔄</span>
  //           <span>Try Again</span>
  //         </button>

  //         <button 
  //           onClick={() => setAppState('dashboard')}
  //           className="btn btn-dashboard"
  //         >
  //           <span className="emoji">🏠</span>
  //           <span>Dashboard</span>
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
  
  const renderResult = () => {
    if (!result) return null; // Prevents errors if result is undefined
  
    return (
      <div className="result-screen-container">
        <div className="result-card">
          <div className="result-header">
            <h2>Game Result</h2>
            <div className={`result-message ${result.correct ? 'correct' : 'incorrect'}`}>
              <span className="emoji">  //       {result.correct ? "Correct! 🎉" : "Not quite right 😕"}              </span>
              {result.correct ? "Correct! Great job!" : "Not quite right"}
            </div>
          </div>
  
          <div className="result-details">
            <div className="result-detail">
              <span className="detail-label">Your Answer:</span>
              <span className="detail-value">{userAnswer}</span>
            </div>
            <div className="result-detail">
              <span className="detail-label">Correct Answer:</span>
              <span className="detail-value">{result.actualAnswer}</span>
            </div>
            <div className="result-detail">
              <span className="detail-label">Score:</span>
              <span className={`detail-value ${result.score > 0 ? 'positive-score' : 'negative-score'}`}>
                {result.score > 0 ? "+" : ""}{result.score.toFixed(2)}
                {result.maxScore > 1 && ` of ${result.maxScore}`}
              </span>
            </div>
          </div>
  
          <div className="result-actions">
            <button 
              onClick={() => {
                setAppState('setup'); // Reset to setup mode
                startGame(); // Restart the game
              }}
              className="btn btn-retry"
            >
              <span className="emoji">🔄</span>
              <span>Try Again</span>
            </button>
  
            <button 
              onClick={() => navigate('/')}
              className="btn btn-dashboard"
            >
              <span className="emoji">🏠</span>
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