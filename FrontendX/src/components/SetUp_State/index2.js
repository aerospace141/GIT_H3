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
        // setIsLoading(false);
        loadLocalData();
      });
    } else {
      console.log("No token found, loading local data");
      loadLocalData();
      // setIsLoading(false);
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

    // setIsLoading(true);
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
        // setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching user data:", err);
        setError("Could not load your data. Using local data instead.");
        loadLocalData();
        // setIsLoading(false);
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

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     const savedData = localStorage.getItem('avecusPerformance');
  //     console.log("Data persistence check:", savedData ? "Data exists in localStorage" : "No data in localStorage");
  //   }, 5000);
    
  //   return () => clearTimeout(timer);
  // }, []);
  
  // Updated gameModes with the three new math operation games at the top
  const gameModes = [
    { value: 'subtraction', label: 'Subtraction Mode' },
    { value: 'multiplication', label: 'Multiplication Mode' },
    { value: 'division', label: 'Division Mode' },
    { value: 'memory', label: 'Memory Mode' },
    { value: 'addition', label: 'Addition Mode' },
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
  
  // Generate number pairs for subtraction, ensuring the first number is larger
const generateSubtractionPairs = () => {
    const pairs = [];
    for (let i = 0; i < count; i++) {
        let num1, num2;
        if (difficulty === 'single') {
            num1 = Math.floor(Math.random() * 9) + 5;  // Start with at least 5
            num2 = Math.floor(Math.random() * Math.min(num1, 5)) + 1;
        } else if (difficulty === 'double') {
            num1 = Math.floor(Math.random() * 50) + 50; // Start with at least 50
            num2 = Math.floor(Math.random() * Math.min(num1, 50)) + 1;
        } else {
            num1 = Math.floor(Math.random() * 500) + 500; // Start with at least 500
            num2 = Math.floor(Math.random() * Math.min(num1, 500)) + 1;
        }
        pairs.push([num1, num2]);
    }
    return pairs;
};

  
  // Generate number pairs for multiplication
  const generateMultiplicationPairs = () => {
    const pairs = [];
    for (let i = 0; i < count; i++) {
      let num1, num2;
      if (difficulty === 'single') {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
      } else if (difficulty === 'double') {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
      } else {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
      }
      pairs.push([num1, num2]);
    }
    return pairs;
  };
  
  // Generate number pairs for division, ensuring clean division
  const generateDivisionPairs = () => {
    const pairs = [];
    for (let i = 0; i < count; i++) {
      let num1, num2;
      if (difficulty === 'single') {
        num2 = Math.floor(Math.random() * 9) + 1;
        const multiplier = Math.floor(Math.random() * 9) + 1;
        num1 = num2 * multiplier;
      } else if (difficulty === 'double') {
        num2 = Math.floor(Math.random() * 12) + 1;
        const multiplier = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * multiplier;
      } else {
        num2 = Math.floor(Math.random() * 20) + 1;
        const multiplier = Math.floor(Math.random() * 20) + 1;
        num1 = num2 * multiplier;
      }
      pairs.push([num1, num2]);
    }
    return pairs;
  };
  
  const startGame = () => {
    let generatedNumbers = [];
    let pairs = [];

    switch(gameType) {
        case 'subtraction':
            pairs = generateSubtractionPairs();
            setComparisonPairs(pairs);
            break;
          case 'multiplication':
            pairs = generateMultiplicationPairs();
            setComparisonPairs(pairs);
            break;
          case 'division':
            pairs = generateDivisionPairs();
            setComparisonPairs(pairs);
            break;

                // New total operation cases
    case 'totalAddition':
      // case 'totalSubtraction':
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
        
        // For totalSubtraction, we'll sort the numbers to ensure no negative results
        
        // if (gameType === 'totalSubtraction') {
        //   generatedNumbers.sort((a, b) => b - a); // Sort descending
        // }
        
        // For totalDivision, ensure clean division (all divisions result in integers)
        if (gameType === 'totalDivision') {
          const baseNumber = generatedNumbers[0];
          // Create divisors that divide evenly into the base number
          generatedNumbers = [baseNumber];
          for (let i = 1; i < count; i++) {
            const divisors = [];
            for (let j = 2; j <= Math.min(baseNumber, 12); j++) {
              if (baseNumber % j === 0) divisors.push(j);
            }
            // If no divisors found, use 1
            generatedNumbers.push(divisors.length > 0 ? 
              divisors[Math.floor(Math.random() * divisors.length)] : 1);
          }
        }
        break;

      // Replace the case for totalSubtraction in the startGame function
// Look for this section around line 420-430 in your code:

case 'totalSubtraction':
  // Create a first number that's guaranteed to be large enough
  let firstNumber;
  if (difficulty === 'single') {
    firstNumber = Math.floor(Math.random() * 30) + 20; // 20-50
  } else if (difficulty === 'double') {
    firstNumber = Math.floor(Math.random() * 100) + 100; // 100-200
  } else {
    firstNumber = Math.floor(Math.random() * 500) + 500; // 500-1000
  }
  
  // Generate subsequent numbers where their sum is less than firstNumber
  const subsequentNumbers = [];
  let remainingValue = firstNumber * 0.8; // Leave some room to ensure positive result
  
  for (let i = 1; i < count; i++) {
    // Determine max value for this position to ensure we don't go negative
    const remainingPositions = count - i;
    const maxForThisPosition = Math.floor(remainingValue / remainingPositions);
    
    // Generate number within appropriate range based on difficulty
    let maxValue;
    if (difficulty === 'single') {
      maxValue = Math.min(9, maxForThisPosition);
    } else if (difficulty === 'double') {
      maxValue = Math.min(99, maxForThisPosition);
    } else {
      maxValue = Math.min(999, maxForThisPosition);
    }
    
    // Ensure we have at least 1
    maxValue = Math.max(1, maxValue);
    
    const nextNum = Math.floor(Math.random() * maxValue) + 1;
    subsequentNumbers.push(nextNum);
    remainingValue -= nextNum;
  }
  
  // Combine firstNumber with subsequent numbers
  generatedNumbers = [firstNumber, ...subsequentNumbers];
  break;

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
    
    // For math operations, we're showing pairs instead of individual numbers
    if (['subtraction', 'multiplication', 'division'].includes(gameType)) {
      showPairsSequentially(pairs); // Use the local variable instead of the state
    } else {
      showNumbersSequentially(generatedNumbers);
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
        score = correct ? 1 : -0.25;
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
        score = correct ? 1 : -0.25;
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
        score = correct ? 1 : -0.25;
        break;
      
          // Add new total operation cases
    case 'totalAddition':
      const totalSum = numbers.reduce((sum, num) => sum + num, 0);
      actualAnswer = totalSum.toString();
      correct = userAnswer === actualAnswer;
      score = correct ? 1 : -0.25;
      break;
      
    // case 'totalSubtraction':
    //   // Start with the first number, then subtract all others
    //   const totalDifference = numbers.reduce((diff, num, idx) => 
    //     idx === 0 ? num : diff - num, 0);
    //   actualAnswer = totalDifference.toString();
    //   correct = userAnswer === actualAnswer;
    //   score = correct ? 1 : -0.25;
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
  score = correct ? 1 : -0.25;
  break;

    
      
    case 'totalMultiplication':
      const totalProduct = numbers.reduce((product, num) => product * num, 1);
      actualAnswer = totalProduct.toString();
      correct = userAnswer === actualAnswer;
      score = correct ? 1 : -0.25;
      break;
      
    case 'totalDivision':
      // Start with the first number, then divide by all others
      const totalQuotient = numbers.reduce((quotient, num, idx) => 
        idx === 0 ? num : quotient / num, 0);
      actualAnswer = totalQuotient.toString();
      correct = userAnswer === actualAnswer;
      score = correct ? 1 : -0.25;
      break;
        
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
      const deviceId = localStorage.getItem('deviceId');

    if (userId) {
      axios.delete(`${API_URL}/performance/${userId}`, {
        headers: { Authorization: `${localStorage.getItem('token')}`,
      'X-Device-Id': deviceId }
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

  // useEffect(() => {
  //   // Simulate loading time and show Netflix-style loading animation
  //   if (appState === 'setup') {
  //     setLoading(true);
  //     setShowImage(true);
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 2000);
  //   }
  // }, [appState]);

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

          <div className="avc-input-group">
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
          </div>

          <div className="avc-input-group">
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
          </div>

          <div className="avc-input-group">
            <label>Number Count:</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min="3"
              max="20"
              className="avc-input"
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

const renderGame = () => (
  <div className='ask-q'>

  <div className="avc-game-container">
      {showingNumbers ? (
          <div>
              <h2 className="avc-game-instruction-header">
                  {getInstructionText()}
              </h2>
              <div className="avc-game-display-container">
                  {getDisplayText()}
              </div>
              <div className="avc-game-progress-indicator">
                  Showing {currentIndex + 1} of {gameType === 'comparison' ? comparisonPairs.length : numbers.length}
              </div>
          </div>
      ) : (
          <div className="avc-game-input-container">
              <h2 className="avc-game-instruction-header">
                  {getInstructionText()}
              </h2>
              <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="avc-game-answer-input"
                  placeholder={getPlaceholderText()}
                  autoFocus
              />
              <button
                  onClick={checkAnswer}
                  className="avc-game-check-button"
              >
                  Check Answer
              </button>
          </div>
      )}
  </div>
  </div>

);

const renderResult = () => {
    if (!result) return null; // Prevents errors if result is undefined
  
    return (
      <div className="avc-result-screen-container">
        <div className="avc-result-card">
          <div className="avc-result-header">
            <h2>Game Result</h2>
            <div className={`avc-result-message ${result.correct ? 'avc-correct' : 'avc-incorrect'}`}>
              <span className="avc-emoji">  {result.correct ? "Correct! 🎉" : "Not quite right 😕"}              </span>
            </div>
          </div>
  
          <div className="avc-result-details">
            <div className="avc-result-detail">
              <span className="avc-detail-label">Your Answer:</span>
              <span className="avc-detail-value">{userAnswer}</span>
            </div>
            <div className="avc-result-detail">
              <span className="avc-detail-label">Correct Answer:</span>
              <span className="avc-detail-value">{result.actualAnswer}</span>
            </div>
            <div className="avc-result-detail">
              <span className={`avc-detail-value ${result.score > 0 ? 'avc-positive-score' : 'avc-negative-score'}`}>
                {result.score > 0 ? "+" : ""}{result.score.toFixed(2)}
                {result.maxScore > 1 && ` of ${result.maxScore}`}
              </span>
            </div>
          </div>
  
          <div className="avc-result-actions">
            <button 
              onClick={() => {
                setAppState('setup'); // Reset to setup mode
                startGame(); // Restart the game
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
  }
  
  return (
    <div className="app-container">
      {appState === 'setup' && renderSetup()}
      {appState === 'game' && renderGame()}
      {appState === 'result' && renderResult()}
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6948409315047214"
     crossorigin="anonymous"></script>
    </div>
  );
};

export default AvecusApp;