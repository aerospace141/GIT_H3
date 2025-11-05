import React, { useState, useEffect } from 'react';
import "../../styles/SetUp_State/index.css"
import axios from 'axios'; // Make sure axios is installed



const AvecusApp = () => {
  // App states
  const [appState, setAppState] = useState('setup'); // setup, game, result, dashboard
  const [gameType, setGameType] = useState('memory'); // memory, addition, counting, etc.
  const [difficulty, setDifficulty] = useState('single'); // single, double, triple
  const [speed, setSpeed] = useState(0.5); // in seconds
  const [count, setCount] = useState(10); // number of digits/items to show
  
  // Game data
  const [numbers, setNumbers] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingNumbers, setShowingNumbers] = useState(false);
  const [result, setResult] = useState({ correct: false, actualAnswer: '', score: 0 });
  const [targetNumber, setTargetNumber] = useState(null);
  const [missingIndices, setMissingIndices] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [comparisonPairs, setComparisonPairs] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // For confirm dialog

  // Performance tracking
  const [performanceData, setPerformanceData] = useState(() => {
    // Try to load from localStorage
    const savedData = localStorage.getItem('avecusPerformance');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing saved performance data", e);
      }
    }
    
    // Default data structure
    return {
      totalGames: 0,
      totalCorrect: 0,
      totalScore: 0,
      gameTypes: {},
      dailyStats: {},
      history: []
    };
  });
  
  // Save performance data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('avecusPerformance', JSON.stringify(performanceData));
  }, [performanceData]);
  
  // Game modes list
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
  
  // Get current date string in format YYYY-MM-DD
  const getCurrentDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  
  // Generate random numbers based on difficulty
  const generateNumbers = () => {
    const newNumbers = [];
    for (let i = 0; i < count; i++) {
      if (difficulty === 'single') {
        newNumbers.push(Math.floor(Math.random() * 10)); // 0-9
      } else if (difficulty === 'double') {
        newNumbers.push(Math.floor(Math.random() * 90 + 10)); // 10-99
      } else {
        newNumbers.push(Math.floor(Math.random() * 900 + 100)); // 100-999
      }
    }
    return newNumbers;
  };
  
  // Generate symbols for symbol association game
  const generateSymbols = () => {
    const symbols = ['★', '♦', '♣', '♠', '♥', '▲', '●', '■', '◆', '○'];
    return Array(count).fill().map(() => symbols[Math.floor(Math.random() * symbols.length)]);
  };
  
  // Generate comparison pairs
  const generateComparisonPairs = () => {
    const pairs = [];
    for (let i = 0; i < count; i++) {
      const num1 = Math.floor(Math.random() * 50) + 1;
      const num2 = Math.floor(Math.random() * 50) + 1;
      pairs.push([num1, num2]);
    }
    return pairs;
  };
  
  // Game logic for different game types
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
        // Create some missing indices (about 1/3 of the array)
        const missing = [];
        const totalMissing = Math.floor(count / 3);
        while (missing.length < totalMissing) {
          const idx = Math.floor(Math.random() * count);
          if (!missing.includes(idx)) missing.push(idx);
        }
        setMissingIndices(missing);
        break;
      case 'oddeven':
        // Generate random numbers
        generatedNumbers = Array(count).fill().map(() => Math.floor(Math.random() * 100));
        break;
      case 'multiples':
        const baseFactor = Math.floor(Math.random() * 9) + 2; // 2-10
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
    
    // Schedule the display of numbers
    showNumbersSequentially(generatedNumbers);
  };
  
  // Show numbers one by one
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
  
  // Check answer based on game type
  const checkAnswer = () => {
    let correct = false;
    let actualAnswer = '';
    let score = 0;
    let maxScore = 1; // Default max score
    
    switch(gameType) {
      case 'memory':
        actualAnswer = numbers.join('');
        correct = userAnswer === actualAnswer;
        score = correct ? 1 : -0.25; // 1 point for correct, -0.25 for incorrect
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
        
        // Calculate partial score - each comparison is worth (1/count) points
        const correctCount = comparisons.filter((c, i) => c === correctComparisons[i]).length;
        maxScore = comparisonPairs.length; // Each pair is worth 1 point
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
    
    // Update result
    setResult({ correct, actualAnswer, score, maxScore });
    
    // Record performance data
    updatePerformanceData(correct, score, maxScore);
    
    // Show result
    setAppState('result');
  };
  
  // Update performance tracking data
  const updatePerformanceData = (correct, score, maxScore) => {
    const today = getCurrentDateString();
    
    setPerformanceData(prevData => {
      // Create a deep copy to modify
      const newData = JSON.parse(JSON.stringify(prevData));
      
      // Update global stats
      newData.totalGames = (newData.totalGames || 0) + 1;
      newData.totalCorrect = (newData.totalCorrect || 0) + (correct ? 1 : 0);
      newData.totalScore = (newData.totalScore || 0) + score;
      
      // Update game type stats
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
      
      // Update daily stats
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
      
      // Update game type within daily stats
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
      
      // Add to history
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
        maxScore
      });
      
      // Limit history to last 100 entries
      if (newData.history.length > 100) {
        newData.history = newData.history.slice(0, 100);
      }
      
      return newData;
    });
  };
  
  // Reset game
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
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Clear performance data
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
    setShowConfirmDialog(false);
  };
  
  // Get display text based on game type
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
  
  // Get instruction text based on game type
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
  
  // Get placeholder text based on game type
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
  
  // Render functions for different states
  const renderSetup = () => (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Avecus Learning App</h1>
      
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setAppState('dashboard')}
          className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600 text-sm"
        >
          View Dashboard
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Challenge Type:</label>
          <select 
            value={gameType} 
            onChange={(e) => setGameType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {gameModes.map(mode => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Difficulty:</label>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="single">Single Digit (1-9)</option>
            <option value="double">Double Digit (10-99)</option>
            <option value="triple">Triple Digit (100-999)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Speed (seconds):</label>
          <input 
            type="number" 
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            step="0.1"
            min="0.1"
            max="5"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Number Count:</label>
          <input 
            type="number" 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))}
            min="3"
            max="20"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button 
          onClick={startGame}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Start Challenge
        </button>
      </div>
    </div>
  );
  
  const renderGame = () => (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center">
      {showingNumbers ? (
        <div className="text-center">
          <h2 className="text-xl mb-4">{getInstructionText()}</h2>
          <div className="text-6xl font-bold mb-8">{getDisplayText()}</div>
          <div className="text-sm text-gray-500">
            Showing {currentIndex + 1} of {gameType === 'comparison' ? comparisonPairs.length : numbers.length}
          </div>
        </div>
      ) : (
        <div className="w-full">
          <h2 className="text-xl mb-4 text-center">
            {getInstructionText()}
          </h2>
          <input 
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder={getPlaceholderText()}
            autoFocus
          />
          <button 
            onClick={checkAnswer}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Check Answer
          </button>
        </div>
      )}
    </div>
  );
  
  const renderResult = () => (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">
        {result.correct ? "Correct! 🎉" : "Not quite right 😕"}
      </h2>
      
      <div className="mb-6">
        <p className="text-lg">Your answer: <span className="font-bold">{userAnswer}</span></p>
        <p className="text-lg">Correct answer: <span className="font-bold">{result.actualAnswer}</span></p>
        
        <p className="text-lg mt-2">
          Score: {result.score > 0 ? "+" : ""}{result.score.toFixed(2)}
          {result.maxScore > 1 && ` of ${result.maxScore}`}
        </p>
      </div>
      
      <div className="flex space-x-4 justify-center">
        <button 
          onClick={() => {
            setAppState('setup');
            startGame();
          }}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Try Again
        </button>
        
        <button 
          onClick={resetGame}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Change Mode
        </button>
        
        <button 
          onClick={() => setAppState('dashboard')}
          className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
  
  const renderDashboard = () => {
    // Calculate daily stats for today
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
        score: stats.score
      });
    }
    
    // Calculate game type stats
    const gameTypeStats = Object.entries(performanceData.gameTypes || {}).map(([type, stats]) => ({
      type,
      label: gameModes.find(m => m.value === type)?.label || type,
      plays: stats.plays,
      accuracy: stats.plays > 0 ? (stats.correct / stats.plays * 100).toFixed(1) : 0,
      score: stats.score.toFixed(2)
    })).sort((a, b) => b.plays - a.plays);
    
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Avecus Performance Dashboard</h1>
          <button
            onClick={() => setAppState('setup')}
            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
          >
            Back to App
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Overall Stats</h3>
            <div className="text-sm">
              <p>Total Games: <span className="font-bold">{performanceData.totalGames || 0}</span></p>
              <p>Accuracy: <span className="font-bold">
                {performanceData.totalGames ? ((performanceData.totalCorrect / performanceData.totalGames) * 100).toFixed(1) : 0}%
              </span></p>
              <p>Total Score: <span className="font-bold">{(performanceData.totalScore || 0).toFixed(2)}</span></p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Today's Performance</h3>
            <div className="text-sm">
              <p>Games Played: <span className="font-bold">{todayStats.plays}</span></p>
              <p>Accuracy: <span className="font-bold">
                {todayStats.plays ? ((todayStats.correct / todayStats.plays) * 100).toFixed(1) : 0}%
              </span></p>
              <p>Today's Score: <span className="font-bold">{todayStats.score.toFixed(2)}</span></p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Game Type Performance</h3>
            <div className="text-sm">
              <p>Most Played: <span className="font-bold">
                {gameTypeStats.length > 0 ? gameTypeStats[0].label : 'N/A'}
              </span></p>
              <p>Best Accuracy: <span className="font-bold">
                {gameTypeStats.length > 0 ? 
                  gameTypeStats.reduce((a, b) => 
                    (parseFloat(a.accuracy) > parseFloat(b.accuracy)) ? a : b
                  ).label : 'N/A'}
              </span></p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Last 7 Days Performance</h3>
          <div className="w-full h-32 bg-gray-50 rounded-lg p-4 flex items-end space-x-1">
            {last7Days.map((day, index) => {
              const height = day.score > 0 ? `${Math.min(100, day.score * 10)}%` : '0%';
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex-1 flex flex-col-reverse">
                    <div 
                      style={{height}} 
                      className={`w-full bg-blue-500 rounded-t`}
                    ></div>
                  </div>
                  <div className="text-xs mt-1 text-center">{day.date}</div>
                  <div className="text-xs font-semibold">{day.score.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Game Type Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Game Type</th>
                    <th className="text-center py-2">Plays</th>
                    <th className="text-center py-2">Accuracy</th>
                    <th className="text-center py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {gameTypeStats.map((stats, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-2">{stats.label}</td>
                      <td className="text-center py-2">{stats.plays}</td>
                      <td className="text-center py-2">{stats.accuracy}%</td>
                      <td className="text-center py-2">{stats.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm max-h-64 overflow-y-auto">
              {performanceData.history?.length ? (
                performanceData.history.map((entry, index) => (
                  <div key={index} className="border-b last:border-b-0 py-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {gameModes.find(m => m.value === entry.gameType)?.label || entry.gameType}
                      </span>
                      <span className={entry.correct ? "text-green-600" : "text-red-600"}>
                        {entry.correct ? "Correct" : "Incorrect"} ({entry.score > 0 ? "+" : ""}{entry.score.toFixed(2)})
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatDate(entry.date)}</span>
                      <span>{entry.difficulty}, {entry.count} items, {entry.speed}s speed</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No activity yet</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <button
            onClick={clearPerformanceData}
            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 text-sm"
          >
            Reset All Data
          </button>
        </div>
      </div>
    );
  };
  
  // Main app render
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      {appState === 'setup' && renderSetup()}
      {appState === 'game' && renderGame()}
      {appState === 'result' && renderResult()}
      {appState === 'dashboard' && renderDashboard()}
    </div>
  );
};

export default AvecusApp;