import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, Send, Lock, Calculator } from 'lucide-react';

const StudentTestComponent = ({ testId, onTestComplete, socket }) => {
  const API_URL = process.env.REACT_APP_API_BASE_URL;
  
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStatus, setTestStatus] = useState('loading');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lateJoinTime, setLateJoinTime] = useState(0);
  
  const testContainerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const visibilityTimeoutRef = useRef(null);

  // Add CSS styles to head
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .test-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        display: flex;
        flex-direction: column;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
      }

      .security-bar {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        color: white;
        padding: 0.75rem 1.5rem;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3);
      }

      .security-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .security-right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .security-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .security-badge-blue {
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid rgba(59, 130, 246, 0.3);
      }

      .security-badge-red {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .header {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(226, 232, 240, 0.5);
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }

      .header-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        letter-spacing: -0.025em;
      }

      .header-difficulty {
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b7280;
        margin-left: 0.5rem;
      }

      .header-progress {
        color: #6b7280;
        font-size: 0.95rem;
        margin: 0.25rem 0 0;
        font-weight: 500;
      }

      .timer {
        font-size: 2rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
      }

      .timer-normal {
        color: #3b82f6;
      }

      .timer-warning {
        color: #f59e0b;
      }

      .timer-critical {
        color: #ef4444;
        animation: pulse 1s infinite;
      }

      .timer-label {
        color: #6b7280;
        font-size: 0.875rem;
        margin: 0;
        font-weight: 500;
      }

      .progress-container {
        margin-top: 1rem;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: linear-gradient(135deg, #e5e7eb, #d1d5db);
        border-radius: 9999px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 9999px;
        transition: width 0.3s ease;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
      }

      .content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .question-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(226, 232, 240, 0.5);
        border-radius: 24px;
        padding: 3rem 2.5rem;
        width: 100%;
        max-width: 800px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      }

      .question-section {
        margin-bottom: 3rem;
      }

      .question-text {
        font-size: 2.5rem;
        font-weight: 800;
        color: #1f2937;
        text-align: center;
        margin: 0 0 3rem;
        letter-spacing: -0.025em;
        background: linear-gradient(135deg, #1f2937, #374151);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .answer-section {
        width: 100%;
      }

      .options-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .option {
        display: flex;
        align-items: center;
        padding: 1.25rem 1.5rem;
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        border: 2px solid transparent;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .option:hover {
        background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
      }

      .option-input {
        margin-right: 1rem;
        width: 1.25rem;
        height: 1.25rem;
        accent-color: #3b82f6;
      }

      .option-text {
        font-size: 1.125rem;
        font-weight: 500;
        color: #374151;
      }

      .input-container {
        text-align: center;
      }

      .answer-input {
        width: 100%;
        padding: 2rem 1.5rem;
        font-size: 2rem;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        font-weight: 600;
        text-align: center;
        background: linear-gradient(135deg, #ffffff, #f8fafc);
        border: 3px solid transparent;
        border-radius: 20px;
        outline: none;
        transition: all 0.3s ease;
        color: #1f2937;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      }

      .answer-input:focus {
        border-color: #3b82f6;
        background: #ffffff;
        box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
        transform: translateY(-2px);
      }

      .input-hint {
        margin: 1rem 0 0;
        color: #6b7280;
        font-size: 0.95rem;
        font-weight: 500;
      }

      .navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .nav-button {
        padding: 0.875rem 2rem;
        border-radius: 14px;
        font-weight: 600;
        font-size: 1rem;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .nav-button-prev {
        background: linear-gradient(135deg, #6b7280, #4b5563);
        color: white;
      }

      .nav-button-prev:hover:not(:disabled) {
        background: linear-gradient(135deg, #4b5563, #374151);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
      }

      .nav-button-prev:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }

      .nav-button-next {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
      }

      .nav-button-next:hover {
        background: linear-gradient(135deg, #2563eb, #1e40af);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
      }

      .nav-button-submit {
        background: linear-gradient(135deg, #10b981, #047857);
        color: white;
      }

      .nav-button-submit:hover:not(:disabled) {
        background: linear-gradient(135deg, #059669, #065f46);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
      }

      .nav-button-submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .submit-spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid #ffffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .progress-indicator {
        color: #6b7280;
        font-weight: 500;
        font-size: 0.95rem;
      }

      .footer {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(226, 232, 240, 0.5);
        padding: 1.5rem 2rem;
      }

      .question-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: center;
      }

      .question-number {
        width: 3rem;
        height: 3rem;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 600;
        border: 2px solid;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .question-number-current {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border-color: #3b82f6;
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
      }

      .question-number-answered {
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        color: #065f46;
        border-color: #10b981;
      }

      .question-number-unanswered {
        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        color: #6b7280;
        border-color: #d1d5db;
      }

      .question-number:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-card {
        background: #ffffff;
        border-radius: 24px;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .modal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #dc2626;
        margin: 0;
      }

      .modal-text {
        color: #374151;
        line-height: 1.6;
        margin: 0 0 1.5rem;
      }

      .violation-details {
        background: linear-gradient(135deg, #fef2f2, #fee2e2);
        border: 1px solid #fecaca;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 2rem;
      }

      .violation-latest {
        color: #dc2626;
        font-size: 0.9rem;
        margin: 0 0 0.5rem;
      }

      .violation-count {
        color: #b91c1c;
        font-size: 0.9rem;
        margin: 0 0 0.5rem;
      }

      .violation-warning {
        color: #7f1d1d;
        font-size: 0.9rem;
        font-weight: 600;
        margin: 0.5rem 0 0;
      }

      .modal-actions {
        text-align: right;
      }

      .modal-button {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 0.75rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .modal-button:hover {
        background: linear-gradient(135deg, #2563eb, #1e40af);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
      }

      .loading-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .loading-content {
        text-align: center;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 3rem 2rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      }

      .loading-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid #ffffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1.5rem;
      }

      .loading-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 0.5rem;
        letter-spacing: -0.025em;
      }

      .loading-subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.95rem;
        margin: 0;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      @media (max-width: 768px) {
        .header {
          padding: 1rem 1.5rem;
        }
        
        .header-content {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }
        
        .question-text {
          font-size: 1.75rem;
        }
        
        .answer-input {
          font-size: 1.5rem;
          padding: 1.5rem 1rem;
        }
        
        .navigation {
          flex-direction: column;
          gap: 1rem;
        }
        
        .nav-button {
          width: 100%;
          justify-content: center;
        }
        
        .question-grid {
          gap: 0.5rem;
        }
        
        .question-number {
          width: 2.5rem;
          height: 2.5rem;
          font-size: 0.875rem;
        }
      }

      @media (max-width: 480px) {
        .content {
          padding: 1rem;
        }
        
        .question-card {
          padding: 2rem 1.5rem;
        }
        
        .security-bar {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
        }
        
        .timer {
          font-size: 1.5rem;
        }
        
        .header-title {
          font-size: 1.25rem;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Generate math questions based on test parameters
  const generateQuestions = (testType, count, difficultyLevel) => {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      let question, correctAnswer;
      let num1, num2;
      
      // Set difficulty ranges
      switch (difficultyLevel) {
        case 'easy':
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          break;
        case 'medium':
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          break;
        case 'double':
          num1 = Math.floor(Math.random() * 99) + 1;
          num2 = Math.floor(Math.random() * 99) + 1;
          break;
        default:
          num1 = Math.floor(Math.random() * 20) + 1;
          num2 = Math.floor(Math.random() * 20) + 1;
      }
      
      // Generate based on test type
      switch (testType) {
        case 'multiplication':
          question = `${num1} × ${num2} = ?`;
          correctAnswer = (num1 * num2).toString();
          break;
        case 'addition':
          question = `${num1} + ${num2} = ?`;
          correctAnswer = (num1 + num2).toString();
          break;
        case 'subtraction':
          // Ensure positive result
          if (num1 < num2) [num1, num2] = [num2, num1];
          question = `${num1} - ${num2} = ?`;
          correctAnswer = (num1 - num2).toString();
          break;
        case 'division':
          // Ensure whole number division
          const product = num1 * num2;
          question = `${product} ÷ ${num1} = ?`;
          correctAnswer = num2.toString();
          break;
        default:
          question = `${num1} × ${num2} = ?`;
          correctAnswer = (num1 * num2).toString();
      }
      
      questions.push({
        question,
        correctAnswer,
        type: testType,
        options: [] // Empty for math problems (text input)
      });
    }
    
    return questions;
  };

  // Fetch test data from your existing backend
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const token = localStorage.getItem('token');
        const deviceId = localStorage.getItem('deviceId');

        if (!token) {
          setTestStatus('error');
          return;
        }

        // Fetch the test details first
        const response = await fetch(`${API_URL}/student/tests/${testId}`, {
          headers: {
            'Authorization': token,
            'X-Device-Id': deviceId,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setTestStatus('no-test');
            console.warn('Test not found or inactive');
            return;
          }
          throw new Error('Failed to load test');
        }

        const testDetails = await response.json();
        
        // Check if test is still active and not past end time
        const now = new Date();
        const testStart = new Date(testDetails.startTime);
        const testEnd = new Date(testStart.getTime() + (testDetails.duration * 60 * 1000));
        
        if (now > testEnd) {
          setTestStatus('test-ended');
          return;
        }

        // Check if student already submitted
        const userId = localStorage.getItem('userId') || 'anonymous';
        const existingResult = testDetails.results?.find(r => r.studentId === userId);
        if (existingResult) {
          setTestStatus('already-submitted');
          return;
        }

        // Calculate late join time if applicable
        let adjustedTimeRemaining = testDetails.duration * 60; // Convert to seconds
        let lateJoinSeconds = 0;
        
        if (now > testStart) {
          lateJoinSeconds = Math.floor((now - testStart) / 1000);
          adjustedTimeRemaining = Math.max(0, adjustedTimeRemaining - lateJoinSeconds);
          setLateJoinTime(lateJoinSeconds);
        }

        // Generate questions if not provided
        let questions = testDetails.questions || [];
        if (questions.length === 0) {
          questions = generateQuestions(
            testDetails.testType, 
            testDetails.count, 
            testDetails.difficultyLevel
          );
        }

        const processedTestData = {
          ...testDetails,
          questions,
          gameType: testDetails.testType // For compatibility
        };

        setTestData(processedTestData);
        setTimeRemaining(adjustedTimeRemaining);
        setAnswers(new Array(questions.length).fill(''));
        setTestStatus('active');
        startTimeRef.current = Date.now();
        
        // Notify admin via socket
        socket?.emit('test-started', { 
          testId: testDetails._id,
          studentId: userId,
          lateJoinSeconds
        });

      } catch (error) {
        console.error('Error loading test:', error);
        setTestStatus('error');
      }
    };

    if (testId) {
      fetchTestData();
    }
  }, [testId, socket, API_URL]);

  // Enhanced fullscreen handling
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (testContainerRef.current && !isFullscreen) {
          if (testContainerRef.current.requestFullscreen) {
            await testContainerRef.current.requestFullscreen();
          } else if (testContainerRef.current.webkitRequestFullscreen) {
            await testContainerRef.current.webkitRequestFullscreen();
          } else if (testContainerRef.current.msRequestFullscreen) {
            await testContainerRef.current.msRequestFullscreen();
          }
          setIsFullscreen(true);
        }
      } catch (error) {
        console.warn('Fullscreen not supported:', error);
        // Continue test even without fullscreen
      }
    };

    if (testStatus === 'active' && testContainerRef.current) {
      enterFullscreen();
    }
  }, [testStatus]);

  // Handle fullscreen changes with stricter enforcement
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && testStatus === 'active') {
        addViolation('Exited fullscreen mode');
        
        // Try to re-enter fullscreen immediately
        if (testContainerRef.current) {
          const enterFullscreen = async () => {
            try {
              if (testContainerRef.current.requestFullscreen) {
                await testContainerRef.current.requestFullscreen();
              } else if (testContainerRef.current.webkitRequestFullscreen) {
                await testContainerRef.current.webkitRequestFullscreen();
              }
            } catch (error) {
              // If can't re-enter after 3 violations, auto-submit
              if (violations.length >= 2) {
                handleAutoSubmit('Multiple fullscreen violations');
              }
            }
          };
          enterFullscreen();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [testStatus, violations]);

  // Enhanced visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && testStatus === 'active') {
        addViolation('Switched to another tab/window');
        
        // Shorter timeout for tab switching - 3 seconds
        visibilityTimeoutRef.current = setTimeout(() => {
          if (document.hidden) {
            handleAutoSubmit('Tab switching violation - remained hidden');
          }
        }, 3000);
      } else if (!document.hidden && visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
        visibilityTimeoutRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [testStatus]);

  // Enhanced browser navigation prevention
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (testStatus === 'active') {
        event.preventDefault();
        event.returnValue = 'Your test is in progress. Leaving will auto-submit your test.';
        return event.returnValue;
      }
    };

    const handlePopState = (event) => {
      if (testStatus === 'active') {
        event.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
        addViolation('Browser navigation attempt');
        handleAutoSubmit('Navigation attempt during test');
      }
    };

    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.pathname);
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [testStatus]);

  // Timer countdown with auto-submit
  useEffect(() => {
    if (testStatus === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit('Time expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [testStatus, timeRemaining]);

  // Send progress updates to admin
  // useEffect(() => {
  //   if (testStatus === 'active' && socket) {
  //     const progressInterval = setInterval(() => {
  //       const answeredCount = answers.filter(a => a.trim() !== '').length;
  //       const progress = (answeredCount / answers.length) * 100;
        
  //       socket.emit('test-progress', {
  //         testId,
  //         studentId: localStorage.getItem('userId') || 'anonymous',
  //         progress: Math.round(progress),
  //         currentQuestion: currentQuestionIndex + 1,
  //         answeredQuestions: answeredCount,
  //         timeRemaining
  //       });
  //     }, 5000);

  //     return () => clearInterval(progressInterval);
  //   }
  // }, [testStatus, answers, currentQuestionIndex, socket, testId, timeRemaining]);

  const addViolation = (violation) => {
    setViolations(prev => {
      const newViolations = [...prev, {
        type: violation,
        timestamp: new Date().toISOString()
      }];
      
      // Auto-submit after 3 violations
      if (newViolations.length >= 3) {
        setTimeout(() => handleAutoSubmit('Maximum violations exceeded'), 100);
      }
      
      return newViolations;
    });
  };

  const handleAutoSubmit = async (reason) => {
    if (isSubmitting) return;
    
    console.log(`Auto-submitting test: ${reason}`);
    await submitTest(true, reason);
  };

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value.trim();
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    if (!testData) return { correct: 0, total: 0, score: 0 };
    
    let correct = 0;
    testData.questions.forEach((question, index) => {
      const userAnswer = answers[index]?.trim().toLowerCase();
      const correctAnswer = question.correctAnswer?.trim().toLowerCase();
      
      if (userAnswer === correctAnswer) {
        correct++;
      }
    });
    
    const total = testData.questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { correct, total, score };
  };

  // const submitTest = async (isAutoSubmit = false, reason = '') => {
  //   if (isSubmitting) return;
    
  //   setIsSubmitting(true);
    
  //   try {
  //     const { correct, total, score } = calculateScore();
  //     const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
  //     const token = localStorage.getItem('token');
  //     const deviceId = localStorage.getItem('deviceId');
  //     const userId = localStorage.getItem('userId') || 'anonymous';

  //     const submissionData = {
  //       studentId: userId,
  //       answers: answers.map((answer, index) => ({
  //         questionIndex: index,
  //         question: testData.questions[index].question,
  //         userAnswer: answer,
  //         correctAnswer: testData.questions[index].correctAnswer,
  //         isCorrect: answer.trim().toLowerCase() === testData.questions[index].correctAnswer.trim().toLowerCase()
  //       })),
  //       correctCount: correct,
  //       totalQuestions: total,
  //       score,
  //       timeSpent,
  //       lateJoinTime,
  //       violations,
  //       isAutoSubmit,
  //       autoSubmitReason: reason,
  //       submittedAt: new Date().toISOString()
  //     };

  //     const response = await fetch(`${API_URL}/student/tests/${testId}/submit`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': token,
  //         'X-Device-Id': deviceId,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(submissionData)
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Submission failed: ${response.status}`);
  //     }

  //     // Update performance data if API exists
  //     try {
  //       const performanceUpdate = {
  //         totalGames: 1,
  //         totalCorrect: correct,
  //         totalScore: score,
  //         gameType: testData.testType,
  //         difficulty: testData.difficultyLevel || 'medium',
  //         speed: 2,
  //         count: total
  //       };

  //       await fetch(`${API_URL}/performance/${userId}`, {
  //         method: 'POST',
  //         headers: {
  //           'Authorization': token,
  //           'X-Device-Id': deviceId,
  //           'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify(performanceUpdate)
  //       });
  //     } catch (perfError) {
  //       console.warn('Performance update failed:', perfError);
  //       // Continue even if performance update fails
  //     }

  //     // Notify admin via socket
  //     socket?.emit('test-submitted', {
  //       testId,
  //       studentId: userId,
  //       score,
  //       correctCount: correct,
  //       totalQuestions: total,
  //       isAutoSubmit,
  //       reason,
  //       timeSpent,
  //       violations: violations.length
  //     });

  //     setTestStatus('submitted');

  //     // Exit fullscreen
  //     if (document.fullscreenElement) {
  //       document.exitFullscreen();
  //     } else if (document.webkitFullscreenElement) {
  //       document.webkitExitFullscreen();
  //     } else if (document.msExitFullscreen) {
  //       document.msExitFullscreen();
  //     }

  //     // Call completion callback
  //     onTestComplete?.({
  //       score,
  //       correct,
  //       total,
  //       isAutoSubmit,
  //       reason,
  //       timeSpent,
  //       violations: violations.length
  //     });

  //   } catch (error) {
  //     console.error('Error submitting test:', error);
      
  //     // Fallback: save to localStorage
  //     try {
  //       const { correct, total, score } = calculateScore();
  //       const fallbackData = {
  //         testId,
  //         score,
  //         correct,
  //         total,
  //         submittedAt: new Date().toISOString(),
  //         isAutoSubmit,
  //         reason
  //       };
        
  //       const existingFallbacks = JSON.parse(localStorage.getItem('testSubmissionFallbacks') || '[]');
  //       existingFallbacks.push(fallbackData);
  //       localStorage.setItem('testSubmissionFallbacks', JSON.stringify(existingFallbacks));
        
  //       console.log('Test saved to localStorage as fallback');
  //     } catch (localError) {
  //       console.error('Error saving fallback:', localError);
  //     }
      
  //     setTestStatus('error');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // ✅ FIXED: Test submission with retry logic and better error handling
const submitTest = async (isAutoSubmit = false, reason = '') => {
  if (isSubmitting) return;
  
  setIsSubmitting(true);
  
  try {
    const { correct, total, score } = calculateScore();
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    const userId = localStorage.getItem('userId') || 'anonymous';

    console.log('📤 Submitting test:', { testId, score, correctCount: correct, timeSpent });

    // ✅ Prepare minimal submission data
    const submissionData = {
      studentId: userId,
      answers: answers.map((answer, index) => ({
        questionIndex: index,
        question: testData.questions[index].question,
        userAnswer: answer,
        correctAnswer: testData.questions[index].correctAnswer,
        isCorrect: answer.trim().toLowerCase() === testData.questions[index].correctAnswer.trim().toLowerCase()
      })),
      correctCount: correct,
      totalQuestions: total,
      score,
      timeSpent,
      lateJoinTime,
      violations,
      isAutoSubmit,
      autoSubmitReason: reason,
      submittedAt: new Date().toISOString()
    };

    // ✅ Retry logic with exponential backoff
    let attempt = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempt < maxAttempts) {
      try {
        console.log(`🔄 Submission attempt ${attempt + 1}/${maxAttempts}`);

        // ✅ Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

        const response = await fetch(`${API_URL}/student/tests/${testId}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'X-Device-Id': deviceId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Submission failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Test submitted successfully:', result);

        // ✅ Success - notify admin via socket
        socket?.emit('test-submitted', {
          testId,
          studentId: userId,
          score,
          correctCount: correct,
          totalQuestions: total,
          isAutoSubmit,
          reason,
          timeSpent,
          violations: violations.length
        });

        setTestStatus('submitted');

        // Exit fullscreen
        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
          } else if (document.webkitFullscreenElement) {
            await document.webkitExitFullscreen();
          }
        } catch (fsError) {
          console.warn('Fullscreen exit error:', fsError);
        }

        // Call completion callback
        onTestComplete?.({
          score,
          correct,
          total,
          isAutoSubmit,
          reason,
          timeSpent,
          violations: violations.length
        });

        return; // Success - exit function

      } catch (fetchError) {
        lastError = fetchError;
        console.error(`❌ Attempt ${attempt + 1} failed:`, fetchError.message);

        if (fetchError.name === 'AbortError') {
          console.log('⏱️ Request timed out');
        }

        // Don't retry on certain errors
        if (fetchError.message.includes('already submitted')) {
          console.log('⚠️ Test already submitted - treating as success');
          setTestStatus('submitted');
          onTestComplete?.({ score, correct, total, isAutoSubmit, reason, timeSpent, violations: violations.length });
          return;
        }

        attempt++;
        
        if (attempt < maxAttempts) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // ✅ All retries failed - save to localStorage as fallback
    throw new Error(lastError?.message || 'Max retries exceeded');

  } catch (error) {
    console.error('❌ Final submission error:', error);
    
    // ✅ Fallback: Save to localStorage
    try {
      const { correct, total, score } = calculateScore();
      const fallbackData = {
        testId,
        studentId: localStorage.getItem('userId'),
        score,
        correctCount: correct,
        totalQuestions: total,
        answers: answers.map((answer, index) => ({
          question: testData.questions[index].question,
          userAnswer: answer,
          correctAnswer: testData.questions[index].correctAnswer
        })),
        submittedAt: new Date().toISOString(),
        isAutoSubmit,
        reason,
        timeSpent: Math.round((Date.now() - startTimeRef.current) / 1000),
        violations,
        status: 'pending-sync'
      };
      
      const existingFallbacks = JSON.parse(localStorage.getItem('testSubmissionFallbacks') || '[]');
      existingFallbacks.push(fallbackData);
      localStorage.setItem('testSubmissionFallbacks', JSON.stringify(existingFallbacks));
      
      console.log('💾 Test saved to localStorage as fallback');
      
      // Show user-friendly message
      alert(
        'Test saved locally!\n\n' +
        'Your answers have been saved on this device. ' +
        'Please inform your teacher about this submission.\n\n' +
        `Score: ${score}% (${correct}/${total} correct)`
      );
      
      setTestStatus('submitted');
      onTestComplete?.({ score, correct, total, isAutoSubmit, reason, timeSpent: fallbackData.timeSpent, violations: violations.length });
      
    } catch (localError) {
      console.error('❌ Error saving fallback:', localError);
      setTestStatus('error');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced keyboard and mouse prevention
  useEffect(() => {
    const preventContextMenu = (e) => {
      if (testStatus === 'active') {
        e.preventDefault();
        addViolation('Right-click attempt');
        return false;
      }
    };

    const preventKeyboardShortcuts = (e) => {
      if (testStatus === 'active') {
        // Prevent common shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) {
          e.preventDefault();
          addViolation('Keyboard shortcut attempt');
          return false;
        }
        
        // Prevent function keys
        if (e.key.startsWith('F') && e.key.length > 1) {
          e.preventDefault();
          addViolation('Function key attempt');
          return false;
        }
      }
    };

    const preventSelection = (e) => {
      if (testStatus === 'active') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
    };
  }, [testStatus]);

  // Status screens
  if (testStatus === 'loading') {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">Loading Test...</h2>
          <p className="loading-subtitle">Preparing your exam questions</p>
        </div>
      </div>
    );
  }

  if (testStatus === 'no-test') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '24px', padding: '3rem 2rem', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
          <Clock style={{ width: '4rem', height: '4rem', color: '#3b82f6', margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>Test Not Found</h2>
          <p style={{ color: '#6b7280', margin: '0 0 2rem', lineHeight: 1.6 }}>The requested test could not be found or is not available.</p>
          <button onClick={() => window.history.back()} style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (testStatus === 'test-ended') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '24px', padding: '3rem 2rem', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
          <AlertTriangle style={{ width: '4rem', height: '4rem', color: '#f59e0b', margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>Test Time Expired</h2>
          <p style={{ color: '#6b7280', margin: '0 0 2rem', lineHeight: 1.6 }}>The time limit for this test has already passed.</p>
          <button onClick={() => window.history.back()} style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (testStatus === 'already-submitted') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '24px', padding: '3rem 2rem', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
          <Send style={{ width: '4rem', height: '4rem', color: '#10b981', margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>Test Already Submitted</h2>
          <p style={{ color: '#6b7280', margin: '0 0 2rem', lineHeight: 1.6 }}>You have already completed this test successfully.</p>
          <button onClick={() => window.history.back()} style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (testStatus === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', padding: '1rem' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '24px', padding: '3rem 2rem', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
          <AlertTriangle style={{ width: '4rem', height: '4rem', color: '#ef4444', margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626', margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>Test Error</h2>
          <p style={{ color: '#6b7280', margin: '0 0 2rem', lineHeight: 1.6 }}>Unable to load or submit the test. Please contact your teacher.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
              Try Again
            </button>
            <button onClick={() => window.history.back()} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, border: '1px solid rgba(107, 114, 128, 0.3)', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(107, 114, 128, 0.1)', color: '#374151' }}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (testStatus === 'submitted') {
    const { correct, total, score } = calculateScore();
    
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', padding: '1rem' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '24px', padding: '3rem 2rem', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Send style={{ color: '#10b981', width: '2rem', height: '2rem' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1rem' }}>Test Submitted Successfully!</h2>
          <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>Your test has been submitted and saved.</p>
          
          <div style={{ background: 'rgba(0, 0, 0, 0.05)', borderRadius: '12px', padding: '1rem', margin: '0 0 1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: '#10b981', marginBottom: '0.5rem' }}>{score}%</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {correct} out of {total} questions correct
            </div>
          </div>
          
          {lateJoinTime > 0 && (
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '0.75rem', margin: '0 0 1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
                You joined {Math.floor(lateJoinTime / 60)}:{(lateJoinTime % 60).toString().padStart(2, '0')} late
              </p>
            </div>
          )}
          
          {violations.length > 0 && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '0.75rem', margin: '0 0 1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                {violations.length} violation{violations.length > 1 ? 's' : ''} recorded
              </p>
            </div>
          )}
          
          <button onClick={() => window.history.back()} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}>   
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!testData) return null;

  const currentQuestion = testData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData.questions.length) * 100;

  return (
    <div 
      ref={testContainerRef}
      className="test-container"
    >
      {/* Security Status Bar */}
      <div className="security-bar">
        <div className="security-left">
          <Lock style={{ width: '1rem', height: '1rem' }} />
          <span style={{ fontWeight: 500 }}>EXAM MODE - Do not close window, switch tabs, or use keyboard shortcuts</span>
        </div>
        <div className="security-right">
          {lateJoinTime > 0 && (
            <span className="security-badge security-badge-blue">
              Late: +{Math.floor(lateJoinTime / 60)}:{(lateJoinTime % 60).toString().padStart(2, '0')}
            </span>
          )}
          {violations.length > 0 && (
            <span className="security-badge security-badge-red">
              {violations.length} violation(s)
            </span>
          )}
        </div>
      </div>

      {/* Timer and Progress Header */}
      <div className="header">
        <div className="header-content">
          <div>
            <h1 className="header-title">
              <Calculator style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} />
              {testData.testType.charAt(0).toUpperCase() + testData.testType.slice(1)} Test
              <span className="header-difficulty">
                ({testData.difficultyLevel})
              </span>
            </h1>
            <p className="header-progress">
              Question {currentQuestionIndex + 1} of {testData.questions.length}
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div className={`timer ${
              timeRemaining < 60 ? 'timer-critical' : 
              timeRemaining < 300 ? 'timer-warning' : 'timer-normal'
            }`}>
              <Clock style={{ width: '1.5rem', height: '1.5rem' }} />
              {formatTime(timeRemaining)}
            </div>
            <p className="timer-label">Time remaining</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="content">
        <div className="question-card">
          <div className="question-section">
            <h2 className="question-text">
              {currentQuestion.question}
            </h2>
            
            {/* Answer Input */}
            <div className="answer-section">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                // Multiple choice
                <div className="options-container">
                  {currentQuestion.options.map((option, index) => (
                    <label 
                      key={index}
                      className="option"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option}
                        checked={answers[currentQuestionIndex] === option}
                        onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                        className="option-input"
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                // Text input for math problems
                <div className="input-container">
                  <input
                    type="text"
                    value={answers[currentQuestionIndex]}
                    onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                    className="answer-input"
                    placeholder="Enter your answer"
                    autoFocus
                    onKeyPress={(e) => {
                      // Allow only numbers and basic math symbols
                      const allowedChars = /[0-9\-+.]/;
                      if (!allowedChars.test(e.key) && e.key !== 'Backspace' && e.key !== 'Enter') {
                        e.preventDefault();
                      }
                      // Submit on Enter if it's the last question
                      if (e.key === 'Enter' && currentQuestionIndex === testData.questions.length - 1) {
                        submitTest(false);
                      }
                    }}
                  />
                  <p className="input-hint">
                    Enter numbers only. Press Enter to move to next question.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="navigation">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className={`nav-button nav-button-prev ${currentQuestionIndex === 0 ? '' : ''}`}
            >
              Previous
            </button>

            <span className="progress-indicator">
              {answers.filter(a => a.trim() !== '').length} of {testData.questions.length} answered
            </span>

            {currentQuestionIndex < testData.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="nav-button nav-button-next"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => submitTest(false)}
                disabled={isSubmitting}
                className="nav-button nav-button-submit"
              >
                {isSubmitting ? (
                  <>
                    <div className="submit-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send style={{ width: '1rem', height: '1rem' }} />
                    Submit Test
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Navigation Footer */}
      <div className="footer">
        <div className="question-grid">
          {testData.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`question-number ${
                index === currentQuestionIndex
                  ? 'question-number-current'
                  : answers[index]?.trim()
                  ? 'question-number-answered'
                  : 'question-number-unanswered'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Modal for Violations */}
      {violations.length > 0 && violations.length % 2 === 1 && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#ef4444' }} />
              <h3 className="modal-title">Security Violation Detected</h3>
            </div>
            <p className="modal-text">
              You have attempted to leave the test environment or use prohibited features. 
              This violation has been recorded.
            </p>
            <div className="violation-details">
              <p className="violation-latest">
                <strong>Latest Violation:</strong> {violations[violations.length - 1]?.type}
              </p>
              <p className="violation-count">
                Total violations: {violations.length}
              </p>
              {violations.length >= 2 && (
                <p className="violation-warning">
                  Warning: One more violation will auto-submit your test!
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  // Modal will auto-close, violation is already recorded
                }}
                className="modal-button"
              >
                Continue Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TestContainer = ({ studentId, socket }) => {
  const API_URL = process.env.REACT_APP_API_BASE_URL;
  const [activeTest, setActiveTest] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for active tests using your existing API structure
  useEffect(() => {
    const checkForActiveTests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const deviceId = localStorage.getItem('deviceId');
        
        if (!token) {
          console.log('No token found');
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Checking for active tests...');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('Device ID:', deviceId);

        // Check for active tests that target this student
        const response = await fetch(`${API_URL}/student/tests/active`, {
          method: 'GET',
          headers: {
            'Authorization': token,
            'X-Device-Id': deviceId,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication failed. Please log in again.');
            return;
          } else if (response.status === 403) {
            setError('Access denied. Please contact your teacher.');
            return;
          }
          throw new Error(`Failed to fetch tests: ${response.status}`);
        }

        const tests = await response.json();
        console.log('Received tests:', tests);
        
        if (tests && tests.length > 0) {
          // Filter tests that are actually active and not expired
          const currentTime = new Date();
          const availableTests = tests.filter(test => {
            const testStart = new Date(test.startTime);
            const testEnd = new Date(testStart.getTime() + (test.duration * 60 * 1000));
            
            console.log('Test:', test._id);
            console.log('Current time:', currentTime);
            console.log('Test start:', testStart);
            console.log('Test end:', testEnd);
            console.log('Is active:', currentTime >= testStart && currentTime < testEnd);
            
            return currentTime >= testStart && currentTime < testEnd;
          });
          
          if (availableTests.length > 0) {
            console.log('Setting active test:', availableTests[0]);
            setActiveTest(availableTests[0]);
          } else {
            console.log('No available tests (all expired or not yet started)');
          }
        } else {
          console.log('No tests found');
        }
      } catch (error) {
        console.error('Error checking for active tests:', error);
        setError(`Error loading tests: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkForActiveTests();

    // Check every 30 seconds for new tests
    // const interval = setInterval(checkForActiveTests, 30000);
    // return () => clearInterval(interval);
  }, [API_URL]);

  // Listen for test events from admin (if socket is available)
  useEffect(() => {
    if (socket) {
      const handleTestLaunched = (testData) => {
        console.log('Test launched event received:', testData);
        setActiveTest(testData);
      };

      const handleTestEnded = (data) => {
        console.log('Test ended event received:', data);
        if (activeTest && activeTest._id === data.testId) {
          setActiveTest(null);
          setShowTest(false);
        }
      };

      socket.on('test-launched', handleTestLaunched);
      socket.on('test-ended', handleTestEnded);

      return () => {
        socket.off('test-launched', handleTestLaunched);
        socket.off('test-ended', handleTestEnded);
      };
    }
  }, [socket, activeTest]);

  const handleStartTest = () => {
    console.log('Starting test:', activeTest);
    setShowTest(true);
  };

  const handleTestComplete = (result) => {
    console.log('Test completed:', result);
    setTestResult(result);
    setShowTest(false);
    setActiveTest(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(226, 232, 240, 0.5)', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(59, 130, 246, 0.3)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#374151', fontWeight: 500, margin: '0 0 0.25rem' }}>Checking for active tests...</p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', padding: '1rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(254, 202, 202, 0.5)', borderRadius: '20px', padding: '2rem', textAlign: 'center', maxWidth: '400px', boxShadow: '0 10px 40px rgba(239, 68, 68, 0.1)' }}>
          <AlertTriangle style={{ width: '3rem', height: '3rem', color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626', margin: '0 0 0.5rem' }}>Error</h2>
          <p style={{ color: '#6b7280', margin: '0 0 2rem', lineHeight: 1.5 }}>{error}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, border: '1px solid rgba(107, 114, 128, 0.3)', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(107, 114, 128, 0.1)', color: '#374151' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showTest && activeTest) {
    return (
      <StudentTestComponent
        testId={activeTest._id || activeTest.id}
        onTestComplete={handleTestComplete}
        socket={socket}
      />
    );
  }

  if (testResult) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dcfdf7 0%, #a7f3d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', padding: '1rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(167, 243, 208, 0.5)', borderRadius: '20px', padding: '2rem', textAlign: 'center', maxWidth: '400px', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.1)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#065f46', margin: '0 0 1rem' }}>Test Complete!</h2>
          <div style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(135deg, #059669, #047857)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 0.5rem' }}>
            {testResult.score}%
          </div>
          <p style={{ color: '#6b7280', margin: '0 0 1.5rem' }}>
            You answered {testResult.correct} out of {testResult.total} questions correctly.
          </p>
          {testResult.isAutoSubmit && (
            <div style={{ borderRadius: '10px', padding: '0.75rem', margin: '0 0 1rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.1)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#92400e' }}>
                <strong>Note:</strong> Test was auto-submitted due to: {testResult.reason}
              </p>
            </div>
          )}
          {testResult.violations > 0 && (
            <div style={{ borderRadius: '10px', padding: '0.75rem', margin: '0 0 1rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#b91c1c' }}>
                <strong>Security Violations:</strong> {testResult.violations} recorded
              </p>
            </div>
          )}
          <button
            onClick={() => setTestResult(null)}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: '0.875rem 2rem', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (activeTest) {
    const now = new Date();
    const testStart = new Date(activeTest.startTime);
    const testEnd = new Date(testStart.getTime() + (activeTest.duration * 60 * 1000));
    const isTestTime = now >= testStart && now < testEnd;
    const isTestOver = now >= testEnd;
    
    console.log('Active test found:', {
      testId: activeTest._id,
      now: now.toISOString(),
      start: testStart.toISOString(),
      end: testEnd.toISOString(),
      isTestTime,
      isTestOver
    });
    
    if (isTestOver) {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', padding: '1rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(253, 230, 138, 0.5)', borderRadius: '20px', padding: '2rem', textAlign: 'center', maxWidth: '400px', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.1)' }}>
            <AlertTriangle style={{ width: '4rem', height: '4rem', color: '#f59e0b', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400e', margin: '0 0 0.5rem' }}>Test Expired</h2>
            <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>The time limit for this test has passed.</p>
            <button 
              onClick={() => setActiveTest(null)} 
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', padding: '1rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(191, 219, 254, 0.5)', borderRadius: '20px', padding: '2rem', textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 40px rgba(59, 130, 246, 0.1)' }}>
          <div style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)' }}>
            <Calculator style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e40af', margin: '0 0 0.5rem' }}>Test Available</h2>
          <p style={{ color: '#6b7280', margin: '0 0 0.5rem' }}>
            {activeTest.testType.charAt(0).toUpperCase() + activeTest.testType.slice(1)} • {activeTest.duration} minutes • {activeTest.count} questions
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
            Difficulty: {activeTest.difficultyLevel}
          </p>
          
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid rgba(147, 197, 253, 0.3)', borderRadius: '12px', padding: '1rem', margin: '0 0 1.5rem' }}>
            <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: '0 0 0.25rem' }}>
              <strong>Test ID:</strong> {activeTest._id}
            </p>
            <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: '0' }}>
              <strong>Started:</strong> {testStart.toLocaleString()}
            </p>
          </div>
          
          {isTestTime ? (
            <>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
                Click below to start your test. Ensure you're in a quiet environment with stable internet.
              </p>
              <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '0.75rem', margin: '0 0 1.5rem' }}>
                <p style={{ color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                  <strong>Important:</strong> Test will run in fullscreen mode. Do not switch tabs or use keyboard shortcuts.
                </p>
              </div>
              <button
                onClick={handleStartTest}
                style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: 'white', padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: 600, fontSize: '1.125rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
              >
                Start Test
              </button>
            </>
          ) : (
            <>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
                Test starts at: {testStart.toLocaleString()}
              </p>
              <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '0.75rem' }}>
                <p style={{ color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                  Please wait for the scheduled start time.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', padding: '1rem' }}>
      <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(226, 232, 240, 0.5)', borderRadius: '20px', padding: '2rem', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Clock style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6b7280', margin: '0 0 0.5rem' }}>No Active Tests</h2>
        <p style={{ color: '#9ca3af', margin: '0 0 2rem' }}>Check back later for new assignments.</p>
        
        <div style={{ background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)', border: '1px solid rgba(209, 213, 219, 0.5)', borderRadius: '12px', padding: '1rem', margin: '0 0 1.5rem', textAlign: 'left', fontSize: '0.75rem' }}>
          <p style={{ color: '#374151', margin: '0 0 0.5rem', fontSize: '0.75rem' }}><strong>Debug Info:</strong></p>
          <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.75rem' }}>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
          <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.75rem' }}>Device ID: {localStorage.getItem('deviceId') || 'Missing'}</p>
          <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.75rem' }}>User ID: {localStorage.getItem('userId') || 'Missing'}</p>
          <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.75rem' }}>Last checked: {new Date().toLocaleTimeString()}</p>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default TestContainer;



// import React, { useState, useEffect, useRef } from 'react';
// import { Clock, AlertTriangle, Send, Lock, Calculator } from 'lucide-react';


// const StudentTestComponent = ({ testId, onTestComplete, socket }) => {
//   const API_URL = 'http://localhost:5000/api';
  
//   const [testData, setTestData] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState([]);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [testStatus, setTestStatus] = useState('loading');
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [violations, setViolations] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [lateJoinTime, setLateJoinTime] = useState(0);
  
//   const testContainerRef = useRef(null);
//   const startTimeRef = useRef(null);
//   const timerRef = useRef(null);
//   const visibilityTimeoutRef = useRef(null);

//   // Generate math questions based on test parameters
//   const generateQuestions = (testType, count, difficultyLevel) => {
//     const questions = [];
    
//     for (let i = 0; i < count; i++) {
//       let question, correctAnswer;
//       let num1, num2;
      
//       // Set difficulty ranges
//       switch (difficultyLevel) {
//         case 'easy':
//           num1 = Math.floor(Math.random() * 10) + 1;
//           num2 = Math.floor(Math.random() * 10) + 1;
//           break;
//         case 'medium':
//           num1 = Math.floor(Math.random() * 50) + 1;
//           num2 = Math.floor(Math.random() * 50) + 1;
//           break;
//         case 'double':
//           num1 = Math.floor(Math.random() * 99) + 1;
//           num2 = Math.floor(Math.random() * 99) + 1;
//           break;
//         default:
//           num1 = Math.floor(Math.random() * 20) + 1;
//           num2 = Math.floor(Math.random() * 20) + 1;
//       }
      
//       // Generate based on test type
//       switch (testType) {
//         case 'multiplication':
//           question = `${num1} × ${num2} = ?`;
//           correctAnswer = (num1 * num2).toString();
//           break;
//         case 'addition':
//           question = `${num1} + ${num2} = ?`;
//           correctAnswer = (num1 + num2).toString();
//           break;
//         case 'subtraction':
//           // Ensure positive result
//           if (num1 < num2) [num1, num2] = [num2, num1];
//           question = `${num1} - ${num2} = ?`;
//           correctAnswer = (num1 - num2).toString();
//           break;
//         case 'division':
//           // Ensure whole number division
//           const product = num1 * num2;
//           question = `${product} ÷ ${num1} = ?`;
//           correctAnswer = num2.toString();
//           break;
//         default:
//           question = `${num1} × ${num2} = ?`;
//           correctAnswer = (num1 * num2).toString();
//       }
      
//       questions.push({
//         question,
//         correctAnswer,
//         type: testType,
//         options: [] // Empty for math problems (text input)
//       });
//     }
    
//     return questions;
//   };

//   // Fetch test data from your existing backend
//   useEffect(() => {
//     const fetchTestData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const deviceId = localStorage.getItem('deviceId');

//         if (!token) {
//           setTestStatus('error');
//           return;
//         }

//         // Fetch the test details first
//         const response = await fetch(`${API_URL}/student/tests/${testId}`, {
//           headers: {
//             'Authorization': token,
//             'X-Device-Id': deviceId,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (!response.ok) {
//           if (response.status === 404) {
//             setTestStatus('no-test');
//             console.warn('Test not found or inactive');
//             return;
//           }
//           throw new Error('Failed to load test');
//         }

//         const testDetails = await response.json();
        
//         // Check if test is still active and not past end time
//         const now = new Date();
//         const testStart = new Date(testDetails.startTime);
//         const testEnd = new Date(testStart.getTime() + (testDetails.duration * 60 * 1000));
        
//         if (now > testEnd) {
//           setTestStatus('test-ended');
//           return;
//         }

//         // Check if student already submitted
//         const userId = localStorage.getItem('userId') || 'anonymous';
//         const existingResult = testDetails.results?.find(r => r.studentId === userId);
//         if (existingResult) {
//           setTestStatus('already-submitted');
//           return;
//         }

//         // Calculate late join time if applicable
//         let adjustedTimeRemaining = testDetails.duration * 60; // Convert to seconds
//         let lateJoinSeconds = 0;
        
//         if (now > testStart) {
//           lateJoinSeconds = Math.floor((now - testStart) / 1000);
//           adjustedTimeRemaining = Math.max(0, adjustedTimeRemaining - lateJoinSeconds);
//           setLateJoinTime(lateJoinSeconds);
//         }

//         // Generate questions if not provided
//         let questions = testDetails.questions || [];
//         if (questions.length === 0) {
//           questions = generateQuestions(
//             testDetails.testType, 
//             testDetails.count, 
//             testDetails.difficultyLevel
//           );
//         }

//         const processedTestData = {
//           ...testDetails,
//           questions,
//           gameType: testDetails.testType // For compatibility
//         };

//         setTestData(processedTestData);
//         setTimeRemaining(adjustedTimeRemaining);
//         setAnswers(new Array(questions.length).fill(''));
//         setTestStatus('active');
//         startTimeRef.current = Date.now();
        
//         // Notify admin via socket
//         socket?.emit('test-started', { 
//           testId: testDetails._id,
//           studentId: userId,
//           lateJoinSeconds
//         });

//       } catch (error) {
//         console.error('Error loading test:', error);
//         setTestStatus('error');
//       }
//     };

//     if (testId) {
//       fetchTestData();
//     }
//   }, [testId, socket, API_URL]);

//   // Enhanced fullscreen handling
//   useEffect(() => {
//     const enterFullscreen = async () => {
//       try {
//         if (testContainerRef.current && !isFullscreen) {
//           if (testContainerRef.current.requestFullscreen) {
//             await testContainerRef.current.requestFullscreen();
//           } else if (testContainerRef.current.webkitRequestFullscreen) {
//             await testContainerRef.current.webkitRequestFullscreen();
//           } else if (testContainerRef.current.msRequestFullscreen) {
//             await testContainerRef.current.msRequestFullscreen();
//           }
//           setIsFullscreen(true);
//         }
//       } catch (error) {
//         console.warn('Fullscreen not supported:', error);
//         // Continue test even without fullscreen
//       }
//     };

//     if (testStatus === 'active' && testContainerRef.current) {
//       enterFullscreen();
//     }
//   }, [testStatus]);

//   // Handle fullscreen changes with stricter enforcement
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       const isCurrentlyFullscreen = Boolean(
//         document.fullscreenElement || 
//         document.webkitFullscreenElement || 
//         document.msFullscreenElement
//       );
//       setIsFullscreen(isCurrentlyFullscreen);
      
//       if (!isCurrentlyFullscreen && testStatus === 'active') {
//         addViolation('Exited fullscreen mode');
        
//         // Try to re-enter fullscreen immediately
//         if (testContainerRef.current) {
//           const enterFullscreen = async () => {
//             try {
//               if (testContainerRef.current.requestFullscreen) {
//                 await testContainerRef.current.requestFullscreen();
//               } else if (testContainerRef.current.webkitRequestFullscreen) {
//                 await testContainerRef.current.webkitRequestFullscreen();
//               }
//             } catch (error) {
//               // If can't re-enter after 3 violations, auto-submit
//               if (violations.length >= 2) {
//                 handleAutoSubmit('Multiple fullscreen violations');
//               }
//             }
//           };
//           enterFullscreen();
//         }
//       }
//     };

//     document.addEventListener('fullscreenchange', handleFullscreenChange);
//     document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
//     document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
//     return () => {
//       document.removeEventListener('fullscreenchange', handleFullscreenChange);
//       document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
//       document.removeEventListener('msfullscreenchange', handleFullscreenChange);
//     };
//   }, [testStatus, violations]);

//   // Enhanced visibility handling
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.hidden && testStatus === 'active') {
//         addViolation('Switched to another tab/window');
        
//         // Shorter timeout for tab switching - 3 seconds
//         visibilityTimeoutRef.current = setTimeout(() => {
//           if (document.hidden) {
//             handleAutoSubmit('Tab switching violation - remained hidden');
//           }
//         }, 3000);
//       } else if (!document.hidden && visibilityTimeoutRef.current) {
//         clearTimeout(visibilityTimeoutRef.current);
//         visibilityTimeoutRef.current = null;
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       if (visibilityTimeoutRef.current) {
//         clearTimeout(visibilityTimeoutRef.current);
//       }
//     };
//   }, [testStatus]);

//   // Enhanced browser navigation prevention
//   useEffect(() => {
//     const handleBeforeUnload = (event) => {
//       if (testStatus === 'active') {
//         event.preventDefault();
//         event.returnValue = 'Your test is in progress. Leaving will auto-submit your test.';
//         return event.returnValue;
//       }
//     };

//     const handlePopState = (event) => {
//       if (testStatus === 'active') {
//         event.preventDefault();
//         window.history.pushState(null, '', window.location.pathname);
//         addViolation('Browser navigation attempt');
//         handleAutoSubmit('Navigation attempt during test');
//       }
//     };

//     // Push current state to prevent back navigation
//     window.history.pushState(null, '', window.location.pathname);
    
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     window.addEventListener('popstate', handlePopState);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       window.removeEventListener('popstate', handlePopState);
//     };
//   }, [testStatus]);

//   // Timer countdown with auto-submit
//   useEffect(() => {
//     if (testStatus === 'active' && timeRemaining > 0) {
//       timerRef.current = setInterval(() => {
//         setTimeRemaining(prev => {
//           if (prev <= 1) {
//             handleAutoSubmit('Time expired');
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);

//       return () => {
//         if (timerRef.current) {
//           clearInterval(timerRef.current);
//         }
//       };
//     }
//   }, [testStatus, timeRemaining]);

//   // Send progress updates to admin
//   useEffect(() => {
//     if (testStatus === 'active' && socket) {
//       const progressInterval = setInterval(() => {
//         const answeredCount = answers.filter(a => a.trim() !== '').length;
//         const progress = (answeredCount / answers.length) * 100;
        
//         socket.emit('test-progress', {
//           testId,
//           studentId: localStorage.getItem('userId') || 'anonymous',
//           progress: Math.round(progress),
//           currentQuestion: currentQuestionIndex + 1,
//           answeredQuestions: answeredCount,
//           timeRemaining
//         });
//       }, 5000);

//       return () => clearInterval(progressInterval);
//     }
//   }, [testStatus, answers, currentQuestionIndex, socket, testId, timeRemaining]);

//   const addViolation = (violation) => {
//     setViolations(prev => {
//       const newViolations = [...prev, {
//         type: violation,
//         timestamp: new Date().toISOString()
//       }];
      
//       // Auto-submit after 3 violations
//       if (newViolations.length >= 3) {
//         setTimeout(() => handleAutoSubmit('Maximum violations exceeded'), 100);
//       }
      
//       return newViolations;
//     });
//   };

//   const handleAutoSubmit = async (reason) => {
//     if (isSubmitting) return;
    
//     console.log(`Auto-submitting test: ${reason}`);
//     await submitTest(true, reason);
//   };

//   const handleAnswerChange = (questionIndex, value) => {
//     const newAnswers = [...answers];
//     newAnswers[questionIndex] = value.trim();
//     setAnswers(newAnswers);
//   };

//   const calculateScore = () => {
//     if (!testData) return { correct: 0, total: 0, score: 0 };
    
//     let correct = 0;
//     testData.questions.forEach((question, index) => {
//       const userAnswer = answers[index]?.trim().toLowerCase();
//       const correctAnswer = question.correctAnswer?.trim().toLowerCase();
      
//       if (userAnswer === correctAnswer) {
//         correct++;
//       }
//     });
    
//     const total = testData.questions.length;
//     const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    
//     return { correct, total, score };
//   };

//   const submitTest = async (isAutoSubmit = false, reason = '') => {
//     if (isSubmitting) return;
    
//     setIsSubmitting(true);
    
//     try {
//       const { correct, total, score } = calculateScore();
//       const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
//       const token = localStorage.getItem('token');
//       const deviceId = localStorage.getItem('deviceId');
//       const userId = localStorage.getItem('userId') || 'anonymous';

//       const submissionData = {
//         studentId: userId,
//         answers: answers.map((answer, index) => ({
//           questionIndex: index,
//           question: testData.questions[index].question,
//           userAnswer: answer,
//           correctAnswer: testData.questions[index].correctAnswer,
//           isCorrect: answer.trim().toLowerCase() === testData.questions[index].correctAnswer.trim().toLowerCase()
//         })),
//         correctCount: correct,
//         totalQuestions: total,
//         score,
//         timeSpent,
//         lateJoinTime,
//         violations,
//         isAutoSubmit,
//         autoSubmitReason: reason,
//         submittedAt: new Date().toISOString()
//       };

//       const response = await fetch(`${API_URL}/student/tests/${testId}/submit`, {
//         method: 'POST',
//         headers: {
//           'Authorization': token,
//           'X-Device-Id': deviceId,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(submissionData)
//       });

//       if (!response.ok) {
//         throw new Error(`Submission failed: ${response.status}`);
//       }

//       // Update performance data if API exists
//       try {
//         const performanceUpdate = {
//           totalGames: 1,
//           totalCorrect: correct,
//           totalScore: score,
//           gameType: testData.testType,
//           difficulty: testData.difficultyLevel || 'medium',
//           speed: 2,
//           count: total
//         };

//         await fetch(`${API_URL}/performance/${userId}`, {
//           method: 'POST',
//           headers: {
//             'Authorization': token,
//             'X-Device-Id': deviceId,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(performanceUpdate)
//         });
//       } catch (perfError) {
//         console.warn('Performance update failed:', perfError);
//         // Continue even if performance update fails
//       }

//       // Notify admin via socket
//       socket?.emit('test-submitted', {
//         testId,
//         studentId: userId,
//         score,
//         correctCount: correct,
//         totalQuestions: total,
//         isAutoSubmit,
//         reason,
//         timeSpent,
//         violations: violations.length
//       });

//       setTestStatus('submitted');

//       // Exit fullscreen
//       if (document.fullscreenElement) {
//         document.exitFullscreen();
//       } else if (document.webkitFullscreenElement) {
//         document.webkitExitFullscreen();
//       } else if (document.msExitFullscreen) {
//         document.msExitFullscreen();
//       }

//       // Call completion callback
//       onTestComplete?.({
//         score,
//         correct,
//         total,
//         isAutoSubmit,
//         reason,
//         timeSpent,
//         violations: violations.length
//       });

//     } catch (error) {
//       console.error('Error submitting test:', error);
      
//       // Fallback: save to localStorage
//       try {
//         const { correct, total, score } = calculateScore();
//         const fallbackData = {
//           testId,
//           score,
//           correct,
//           total,
//           submittedAt: new Date().toISOString(),
//           isAutoSubmit,
//           reason
//         };
        
//         const existingFallbacks = JSON.parse(localStorage.getItem('testSubmissionFallbacks') || '[]');
//         existingFallbacks.push(fallbackData);
//         localStorage.setItem('testSubmissionFallbacks', JSON.stringify(existingFallbacks));
        
//         console.log('Test saved to localStorage as fallback');
//       } catch (localError) {
//         console.error('Error saving fallback:', localError);
//       }
      
//       setTestStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Enhanced keyboard and mouse prevention
//   useEffect(() => {
//     const preventContextMenu = (e) => {
//       if (testStatus === 'active') {
//         e.preventDefault();
//         addViolation('Right-click attempt');
//         return false;
//       }
//     };

//     const preventKeyboardShortcuts = (e) => {
//       if (testStatus === 'active') {
//         // Prevent common shortcuts
//         if (e.ctrlKey || e.metaKey || e.altKey) {
//           e.preventDefault();
//           addViolation('Keyboard shortcut attempt');
//           return false;
//         }
        
//         // Prevent function keys
//         if (e.key.startsWith('F') && e.key.length > 1) {
//           e.preventDefault();
//           addViolation('Function key attempt');
//           return false;
//         }
//       }
//     };

//     const preventSelection = (e) => {
//       if (testStatus === 'active') {
//         e.preventDefault();
//         return false;
//       }
//     };

//     document.addEventListener('contextmenu', preventContextMenu);
//     document.addEventListener('keydown', preventKeyboardShortcuts);
//     document.addEventListener('selectstart', preventSelection);
//     document.addEventListener('dragstart', preventSelection);

//     return () => {
//       document.removeEventListener('contextmenu', preventContextMenu);
//       document.removeEventListener('keydown', preventKeyboardShortcuts);
//       document.removeEventListener('selectstart', preventSelection);
//       document.removeEventListener('dragstart', preventSelection);
//     };
//   }, [testStatus]);

//   // Status screens
//   if (testStatus === 'loading') {
//     return (
//       <div className="stc__loading-container">
//         <div className="stc__loading-content">
//           <div className="stc__loading-spinner"></div>
//           <h2 className="stc__loading-title">Loading Test...</h2>
//           <p className="stc__loading-subtitle">Preparing your exam questions</p>
//         </div>
//         <style jsx>{`
//           .stc__loading-container {
//             min-height: 100vh;
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//           }
//           .stc__loading-content {
//             text-align: center;
//             background: rgba(255, 255, 255, 0.1);
//             backdrop-filter: blur(20px);
//             border: 1px solid rgba(255, 255, 255, 0.2);
//             border-radius: 20px;
//             padding: 3rem 2rem;
//             box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
//           }
//           .stc__loading-spinner {
//             width: 48px;
//             height: 48px;
//             border: 4px solid rgba(255, 255, 255, 0.3);
//             border-top: 4px solid #ffffff;
//             border-radius: 50%;
//             animation: stc-spin 1s linear infinite;
//             margin: 0 auto 1.5rem;
//           }
//           .stc__loading-title {
//             font-size: 1.5rem;
//             font-weight: 600;
//             color: #ffffff;
//             margin: 0 0 0.5rem;
//             letter-spacing: -0.025em;
//           }
//           .stc__loading-subtitle {
//             color: rgba(255, 255, 255, 0.8);
//             font-size: 0.95rem;
//             margin: 0;
//           }
//           @keyframes stc-spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (testStatus === 'no-test') {
//     return (
//       <div className="stc__status-container stc__status-container--info">
//         <div className="stc__status-card">
//           <Clock className="stc__status-icon stc__status-icon--info" />
//           <h2 className="stc__status-title">Test Not Found</h2>
//           <p className="stc__status-text">The requested test could not be found or is not available.</p>
//           <button onClick={() => window.history.back()} className="stc__status-button stc__status-button--primary">
//             Go Back
//           </button>
//         </div>
//         <style jsx>{`
//           .stc__status-container {
//             min-height: 100vh;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//             padding: 1rem;
//           }
//           .stc__status-container--info {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           }
//           .stc__status-card {
//             background: rgba(255, 255, 255, 0.95);
//             backdrop-filter: blur(20px);
//             border: 1px solid rgba(255, 255, 255, 0.3);
//             border-radius: 24px;
//             padding: 3rem 2rem;
//             text-align: center;
//             max-width: 400px;
//             box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
//           }
//           .stc__status-icon {
//             width: 4rem;
//             height: 4rem;
//             margin: 0 auto 1.5rem;
//             display: block;
//           }
//           .stc__status-icon--info {
//             color: #3b82f6;
//           }
//           .stc__status-title {
//             font-size: 1.5rem;
//             font-weight: 700;
//             color: #1f2937;
//             margin: 0 0 0.75rem;
//             letter-spacing: -0.025em;
//           }
//           .stc__status-text {
//             color: #6b7280;
//             margin: 0 0 2rem;
//             line-height: 1.6;
//           }
//           .stc__status-button {
//             padding: 0.75rem 2rem;
//             border-radius: 12px;
//             font-weight: 600;
//             font-size: 0.95rem;
//             border: none;
//             cursor: pointer;
//             transition: all 0.2s;
//           }
//           .stc__status-button--primary {
//             background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
//             color: white;
//           }
//           .stc__status-button--primary:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (testStatus === 'test-ended') {
//     return (
//       <div className="stc__status-container stc__status-container--warning">
//         <div className="stc__status-card">
//           <AlertTriangle className="stc__status-icon stc__status-icon--warning" />
//           <h2 className="stc__status-title">Test Time Expired</h2>
//           <p className="stc__status-text">The time limit for this test has already passed.</p>
//           <button onClick={() => window.history.back()} className="stc__status-button stc__status-button--primary">
//             Go Back
//           </button>
//         </div>
//         <style jsx>{`
//           .stc__status-container--warning {
//             background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
//           }
//           .stc__status-icon--warning {
//             color: #f59e0b;
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (testStatus === 'already-submitted') {
//     return (
//       <div className="stc__status-container stc__status-container--success">
//         <div className="stc__status-card">
//           <Send className="stc__status-icon stc__status-icon--success" />
//           <h2 className="stc__status-title">Test Already Submitted</h2>
//           <p className="stc__status-text">You have already completed this test successfully.</p>
//           <button onClick={() => window.history.back()} className="stc__status-button stc__status-button--primary">
//             Go Back
//           </button>
//         </div>
//         <style jsx>{`
//           .stc__status-container--success {
//             background: linear-gradient(135deg, #10b981 0%, #047857 100%);
//           }
//           .stc__status-icon--success {
//             color: #10b981;
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (testStatus === 'error') {
//     return (
//       <div className="stc__status-container stc__status-container--error">
//         <div className="stc__status-card">
//           <AlertTriangle className="stc__status-icon stc__status-icon--error" />
//           <h2 className="stc__status-title">Test Error</h2>
//           <p className="stc__status-text">Unable to load or submit the test. Please contact your teacher.</p>
//           <div className="stc__status-buttons">
//             <button onClick={() => window.location.reload()} className="stc__status-button stc__status-button--primary">
//               Try Again
//             </button>
//             <button onClick={() => window.history.back()} className="stc__status-button stc__status-button--secondary">
//               Go Back
//             </button>
//           </div>
//         </div>
//         <style jsx>{`
//           .stc__status-container--error {
//             background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
//           }
//           .stc__status-icon--error {
//             color: #ef4444;
//           }
//           .stc__status-buttons {
//             display: flex;
//             gap: 0.75rem;
//             justify-content: center;
//             flex-wrap: wrap;
//           }
//           .stc__status-button--secondary {
//             background: rgba(107, 114, 128, 0.1);
//             color: #374151;
//             border: 1px solid rgba(107, 114, 128, 0.3);
//           }
//           .stc__status-button--secondary:hover {
//             background: rgba(107, 114, 128, 0.2);
//             transform: translateY(-1px);
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (testStatus === 'submitted') {
//     const { correct, total, score } = calculateScore();
    
//     return (
//       <>
//         <div className="stc__completion-container">
//           <div className="stc__completion-card">
//             <div className="stc__completion-icon-wrapper">
//               <Send className="stc__completion-icon" />
//             </div>
//             <h2 className="stc__completion-title">Test Submitted Successfully!</h2>
//             <p className="stc__completion-subtitle">Your test has been submitted and saved.</p>
            
//             <div className="stc__score-display">
//               <div className="stc__score-value">{score}%</div>
//               <div className="stc__score-details">
//                 {correct} out of {total} questions correct
//               </div>
//             </div>
            
//             {lateJoinTime > 0 && (
//               <div className="stc__info-badge stc__info-badge--blue">
//                 <p className="stc__info-text">
//                   You joined {Math.floor(lateJoinTime / 60)}:{(lateJoinTime % 60).toString().padStart(2, '0')} late
//                 </p>
//               </div>
//             )}
            
//             {violations.length > 0 && (
//               <div className="stc__info-badge stc__info-badge--yellow">
//                 <p className="stc__info-text">
//                   {violations.length} violation{violations.length > 1 ? 's' : ''} recorded
//                 </p>
//               </div>
//             )}
            
//             <button onClick={() => window.history.back()} className="stc__completion-button stc__completion-button--primary">   
//               Return to Dashboard
//             </button>
//           </div>
//         </div>
        
//         <style jsx>{`
//           .stc__completion-container {
//             min-height: 100vh;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//             padding: 1rem;
//             background: linear-gradient(135deg, #10b981 0%, #047857 100%);
//           }
//           .stc__completion-card {
//             background: rgba(255, 255, 255, 0.95);
//             backdrop-filter: blur(20px);
//             border: 1px solid rgba(255, 255, 255, 0.3);
//             border-radius: 24px;
//             padding: 3rem 2rem;
//             text-align: center;
//             max-width: 400px;
//             box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
//           }
//           .stc__completion-icon-wrapper {
//             width: 4rem;
//             height: 4rem;
//             border-radius: 50%;
//             background: rgba(0, 0, 0, 0.1);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             margin: 0 auto 2rem;
//           }
//           .stc__completion-icon {
//             color: #10b981;
//             width: 2rem;
//             height: 2rem;
//           }
//           .stc__completion-title {
//             font-size: 1.5rem;
//             margin-bottom: 1rem;
//           }
//           .stc__completion-subtitle {
//             font-size: 1rem;
//             margin-bottom: 2rem;
//           }
//           .stc__score-display {
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             margin-bottom: 2rem;
//           }
//           .stc__score-value {
//             font-size: 2rem;
//             font-weight: 600;
//             margin-right: 1rem;
//           }
//           .stc__score-details {
//             font-size: 0.875rem;
//           }
//           .stc__info-badge {
//             display: inline-block;
//             padding: 0.25rem 0.5rem;
//             border-radius: 4px;
//             margin-right: 0.5rem;
//             margin-bottom: 0.5rem;
//             font-size: 0.875rem;
//             font-weight: 500;
//           }
//           .stc__info-badge--blue {
//             background: rgba(0, 0, 255, 0.1);
//             color: #0000ff;
//           }
//           .stc__info-badge--yellow {
//             background: rgba(255, 255, 0, 0.1);
//             color: #ffff00;
//           }
//           .stc__completion-button {
//             cursor: pointer;
//             border: none;
//             border-radius: 4px;
//             padding: 0.5rem 1rem;
//             font-size: 1rem;
//             font-weight: 500;
//             margin-top: 2rem;
//           }
//           .stc__completion-button--primary {
//             background: #10b981;
//             color: #fff;
//           }
//           .stc__completion-button--primary:hover {
//             background: #047857;
//           }
//         `}</style>
//       </>
//     );
//   };
//   };
  
//   const TestContainer = ({ studentId, socket }) => {
//   const API_URL = 'http://localhost:5000/api';
//   const [activeTest, setActiveTest] = useState(null);
//   const [showTest, setShowTest] = useState(false);
//   const [testResult, setTestResult] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Check for active tests using your existing API structure
//   useEffect(() => {
//     const checkForActiveTests = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const token = localStorage.getItem('token');
//         const deviceId = localStorage.getItem('deviceId');
        
//         if (!token) {
//           console.log('No token found');
//           setError('No authentication token found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         console.log('Checking for active tests...');
//         console.log('Token:', token ? 'Present' : 'Missing');
//         console.log('Device ID:', deviceId);

//         // Check for active tests that target this student
//         const response = await fetch(`${API_URL}/student/tests/active`, {
//           method: 'GET',
//           headers: {
//             'Authorization': token,
//             'X-Device-Id': deviceId,
//             'Content-Type': 'application/json'
//           }
//         });

//         console.log('Response status:', response.status);
        
//         if (!response.ok) {
//           if (response.status === 401) {
//             setError('Authentication failed. Please log in again.');
//             return;
//           } else if (response.status === 403) {
//             setError('Access denied. Please contact your teacher.');
//             return;
//           }
//           throw new Error(`Failed to fetch tests: ${response.status}`);
//         }

//         const tests = await response.json();
//         console.log('Received tests:', tests);
        
//         if (tests && tests.length > 0) {
//           // Filter tests that are actually active and not expired
//           const currentTime = new Date();
//           const availableTests = tests.filter(test => {
//             const testStart = new Date(test.startTime);
//             const testEnd = new Date(testStart.getTime() + (test.duration * 60 * 1000));
            
//             console.log('Test:', test._id);
//             console.log('Current time:', currentTime);
//             console.log('Test start:', testStart);
//             console.log('Test end:', testEnd);
//             console.log('Is active:', currentTime >= testStart && currentTime < testEnd);
            
//             return currentTime >= testStart && currentTime < testEnd;
//           });
          
//           if (availableTests.length > 0) {
//             console.log('Setting active test:', availableTests[0]);
//             setActiveTest(availableTests[0]);
//           } else {
//             console.log('No available tests (all expired or not yet started)');
//           }
//         } else {
//           console.log('No tests found');
//         }
//       } catch (error) {
//         console.error('Error checking for active tests:', error);
//         setError(`Error loading tests: ${error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkForActiveTests();

//     // Check every 30 seconds for new tests
//     const interval = setInterval(checkForActiveTests, 30000);
//     return () => clearInterval(interval);
//   }, [API_URL]);

//   // Listen for test events from admin (if socket is available)
//   useEffect(() => {
//     if (socket) {
//       const handleTestLaunched = (testData) => {
//         console.log('Test launched event received:', testData);
//         setActiveTest(testData);
//       };

//       const handleTestEnded = (data) => {
//         console.log('Test ended event received:', data);
//         if (activeTest && activeTest._id === data.testId) {
//           setActiveTest(null);
//           setShowTest(false);
//         }
//       };

//       socket.on('test-launched', handleTestLaunched);
//       socket.on('test-ended', handleTestEnded);

//       return () => {
//         socket.off('test-launched', handleTestLaunched);
//         socket.off('test-ended', handleTestEnded);
//       };
//     }
//   }, [socket, activeTest]);

//   const handleStartTest = () => {
//     console.log('Starting test:', activeTest);
//     setShowTest(true);
//   };

//   const handleTestComplete = (result) => {
//     console.log('Test completed:', result);
//     setTestResult(result);
//     setShowTest(false);
//     setActiveTest(null);
//   };

//   if (loading) {
//     return (
//       <div className="tc__loading-container">
//         <div className="tc__loading-content">
//           <div className="tc__loading-spinner"></div>
//           <p className="tc__loading-text">Checking for active tests...</p>
//           <p className="tc__loading-subtext">This may take a moment</p>
//         </div>
//         <style jsx>{`
//           .tc__loading-container {
//             min-height: 100vh;
//             background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//           }
//           .tc__loading-content {
//             text-align: center;
//             background: rgba(255, 255, 255, 0.8);
//             backdrop-filter: blur(20px);
//             border: 1px solid rgba(226, 232, 240, 0.5);
//             border-radius: 20px;
//             padding: 2rem;
//             box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
//           }
//           .tc__loading-spinner {
//             width: 32px;
//             height: 32px;
//             border: 3px solid rgba(59, 130, 246, 0.3);
//             border-top: 3px solid #3b82f6;
//             border-radius: 50%;
//             animation: tc-spin 1s linear infinite;
//             margin: 0 auto 1rem;
//           }
//           .tc__loading-text {
//             color: #374151;
//             font-weight: 500;
//             margin: 0 0 0.25rem;
//           }
//           .tc__loading-subtext {
//             color: #9ca3af;
//             font-size: 0.875rem;
//             margin: 0;
//           }
//           @keyframes tc-spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="tc__error-container">
//         <div className="tc__error-card">
//           <AlertTriangle className="tc__error-icon" />
//           <h2 className="tc__error-title">Error</h2>
//           <p className="tc__error-text">{error}</p>
//           <div className="tc__error-actions">
//             <button onClick={() => window.location.reload()} className="tc__error-button tc__error-button--primary">
//               Retry
//             </button>
//             <button onClick={() => setError(null)} className="tc__error-button tc__error-button--secondary">
//               Dismiss
//             </button>
//           </div>
//         </div>
//         <style jsx>{`
//           .tc__error-container {
//             min-height: 100vh;
//             background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//             padding: 1rem;
//           }
//           .tc__error-card {
//             background: rgba(255, 255, 255, 0.95);
//             backdrop-filter: blur(20px);
//             border: 1px solid rgba(254, 202, 202, 0.5);
//             border-radius: 20px;
//             padding: 2rem;
//             text-align: center;
//             max-width: 400px;
//             box-shadow: 0 10px 40px rgba(239, 68, 68, 0.1);
//           }
//           .tc__error-icon {
//             width: 3rem;
//             height: 3rem;
//             color: #ef4444;
//             margin: 0 auto 1rem;
//           }
//           .tc__error-title {
//             font-size: 1.5rem;
//             font-weight: 700;
//             color: #dc2626;
//             margin: 0 0 0.5rem;
//           }
//           .tc__error-text {
//             color: #6b7280;
//             margin: 0 0 2rem;
//             line-height: 1.5;
//           }
//           .tc__error-actions {
//             display: flex;
//             gap: 0.75rem;
//             justify-content: center;
//           }
//           .tc__error-button {
//             padding: 0.75rem 1.5rem;
//             border-radius: 10px;
//             font-weight: 600;
//             border: none;
//             cursor: pointer;
//             transition: all 0.2s;
//           }
//           .tc__error-button--primary {
//             background: linear-gradient(135deg, #3b82f6, #1d4ed8);
//             color: white;
//           }
//           .tc__error-button--primary:hover {
//             background: linear-gradient(135deg, #2563eb, #1e40af);
//             transform: translateY(-1px);
//           }
//           .tc__error-button--secondary {
//             background: rgba(107, 114, 128, 0.1);
//             color: #374151;
//             border: 1px solid rgba(107, 114, 128, 0.3);
//           }
//           .tc__error-button--secondary:hover {
//             background: rgba(107, 114, 128, 0.2);
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (showTest && activeTest) {
//     return (
//       <StudentTestComponent
//         testId={activeTest._id || activeTest.id}
//         onTestComplete={handleTestComplete}
//         socket={socket}
//       />
//     );
//   }

//   if (testResult) {
//     return (
//       <div className="tc__result-container">
//         <div className="tc__result-card">
//           <h2 className="tc__result-title">Test Complete!</h2>
//           <div className="tc__result-score">{testResult.score}%</div>
//           <p className="tc__result-details">
//             You answered {testResult.correct} out of {testResult.total} questions correctly.
//           </p>
//           {testResult.isAutoSubmit && (
//             <div className="tc__result-info tc__result-info--warning">
//               <p className="tc__result-info-text">
//                 <strong>Note:</strong> Test was auto-submitted due to: {testResult.reason}
//               </p>
//             </div>
//           )}
//           {testResult.violations > 0 && (
//             <div className="tc__result-info tc__result-info--error">
//               <p className="tc__result-info-text">
//                 <strong>Security Violations:</strong> {testResult.violations} recorded
//               </p>
//             </div>
//           )}
//           <button onClick={() => setTestResult(null)} className="tc__result-button">
//             Continue
//           </button>
//         </div>
//         <style jsx>{`
//           .tc__result-container {
//             min-height: 100vh;
//             background: linear-gradient(135deg, #dcfdf7 0%, #a7f3d0 100%);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//             padding: 1rem;
//           }
//           .tc__result-card {
//             background: rgba(255, 255, 255, 0.95);
//             backdrop-filter: blur(20px);
//             border: 1px solid rgba(167, 243, 208, 0.5);
//             border-radius: 20px;
//             padding: 2rem;
//             text-align: center;
//             max-width: 400px;
//             box-shadow: 0 10px 40px rgba(16, 185, 129, 0.1);
//           }
//           .tc__result-title {
//             font-size: 1.75rem;
//             font-weight: 700;
//             color: #065f46;
//             margin: 0 0 1rem;
//           }
//           .tc__result-score {
//             font-size: 3rem;
//             font-weight: 800;
//             background: linear-gradient(135deg, #059669, #047857);
//             -webkit-background-clip: text;
//             -webkit-text-fill-color: transparent;
//             background-clip: text;
//             margin: 0 0 0.5rem;
//           }
//           .tc__result-details {
//             color: #6b7280;
//             margin: 0 0 1.5rem;
//           }
//           .tc__result-info {
//             border-radius: 10px;
//             padding: 0.75rem;
//             margin: 0 0 1rem;
//             border: 1px solid;
//           }
//           .tc__result-info--warning {
//             background: rgba(245, 158, 11, 0.1);
//             border-color: rgba(245, 158, 11, 0.3);
//           }
//           .tc__result-info--error {
//             background: rgba(239, 68, 68, 0.1);
//             border-color: rgba(239, 68, 68, 0.3);
//           }
//           .tc__result-info-text {
//             margin: 0;
//             font-size: 0.875rem;
//             font-weight: 500;
//           }
//           .tc__result-info--warning .tc__result-info-text {
//             color: #92400e;
//           }
//           .tc__result-info--error .tc__result-info-text {
//             color: #b91c1c;
//           }
//           .tc__result-button {
//             background: linear-gradient(135deg, #3b82f6, #1d4ed8);
//             color: white;
//             padding: 0.875rem 2rem;
//             border-radius: 12px;
//             font-weight: 600;
//             border: none;
//             cursor: pointer;
//             transition: all 0.3s;
//           }
//           .tc__result-button:hover {
//             background: linear-gradient(135deg, #2563eb, #1e40af);
//             transform: translateY(-2px);
//             box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (activeTest) {
//     const now = new Date();
//     const testStart = new Date(activeTest.startTime);
//     const testEnd = new Date(testStart.getTime() + (activeTest.duration * 60 * 1000));
//     const isTestTime = now >= testStart && now < testEnd;
//     const isTestOver = now >= testEnd;
    
//     console.log('Active test found:', {
//       testId: activeTest._id,
//       now: now.toISOString(),
//       start: testStart.toISOString(),
//       end: testEnd.toISOString(),
//       isTestTime,
//       isTestOver
//     });
    
//     if (isTestOver) {
//       return (
//         <div className="tc__expired-container">
//           <div className="tc__expired-card">
//             <AlertTriangle className="tc__expired-icon" />
//             <h2 className="tc__expired-title">Test Expired</h2>
//             <p className="tc__expired-text">The time limit for this test has passed.</p>
//             <button onClick={() => setActiveTest(null)} className="tc__expired-button">
//               Continue
//             </button>
//           </div>
//           <style jsx>{`
//             .tc__expired-container {
//               min-height: 100vh;
//               background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
//               display: flex;
//               align-items: center;
//               justify-content: center;
//               font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//               padding: 1rem;
//             }
//             .tc__expired-card {
//               background: rgba(255, 255, 255, 0.95);
//               backdrop-filter: blur(20px);
//               border: 1px solid rgba(253, 230, 138, 0.5);
//               border-radius: 20px;
//               padding: 2rem;
//               text-align: center;
//               max-width: 400px;
//               box-shadow: 0 10px 40px rgba(245, 158, 11, 0.1);
//             }
//             .tc__expired-icon {
//               width: 4rem;
//               height: 4rem;
//               color: #f59e0b;
//               margin: 0 auto 1rem;
//             }
//             .tc__expired-title {
//               font-size: 1.5rem;
//               font-weight: 700;
//               color: #92400e;
//               margin: 0 0 0.5rem;
//             }
//             .tc__expired-text {
//               color: #6b7280;
//               margin: 0 0 2rem;
//             }
//             .tc__expired-button {
//               background: linear-gradient(135deg, #3b82f6, #1d4ed8);
//               color: white;
//               padding: 0.75rem 2rem;
//               border-radius: 12px;
//               font-weight: 600;
//               border: none;
//               cursor: pointer;
//               transition: all 0.3s;
//             }
//             .tc__expired-button:hover {
//               background: linear-gradient(135deg, #2563eb, #1e40af);
//               transform: translateY(-2px);
//               box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
//             }
//           `}</style>
//         </div>
//       );
//     }
    
//     return (
//       <div className="tc__waiting-container">
//         <div className="tc__waiting-card">
//           <div className="tc__waiting-icon-wrapper">
//             <Calculator className="tc__waiting-icon" />
//           </div>
//           <h2 className="tc__waiting-title">Test Available</h2>
//           <p className="tc__waiting-subtitle">
//             {activeTest.testType.charAt(0).toUpperCase() + activeTest.testType.slice(1)} • {activeTest.duration} minutes • {activeTest.count} questions
//           </p>
//           <p className="tc__waiting-difficulty">
//             Difficulty: {activeTest.difficultyLevel}
//           </p>
          
//           <div className="tc__waiting-info">
//             <p className="tc__waiting-info-text">
//               <strong>Test ID:</strong> {activeTest._id}
//             </p>
//             <p className="tc__waiting-info-text">
//               <strong>Started:</strong> {testStart.toLocaleString()}
//             </p>
//           </div>
          
//           {isTestTime ? (
//             <>
//               <p className="tc__waiting-instruction">
//                 Click below to start your test. Ensure you're in a quiet environment with stable internet.
//               </p>
//               <div className="tc__waiting-warning">
//                 <p className="tc__waiting-warning-text">
//                   <strong>Important:</strong> Test will run in fullscreen mode. Do not switch tabs or use keyboard shortcuts.
//                 </p>
//               </div>
//               <button onClick={handleStartTest} className="tc__waiting-button tc__waiting-button--start">
//                 Start Test
//               </button>
//             </>
//           ) : (
//             <>
//               <p className="tc__waiting-instruction">
//                 Test starts at: {testStart.toLocaleString()}
//               </p>
//               <div className="tc__waiting-info">
//                 <p className="tc__waiting-info-text">
//                   Please wait for the scheduled start time.
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//         <style jsx>{`
//           .tc__waiting-container {
//             min-height: 100vh;
//             background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//             padding: 1rem;
//           }
//           .tc__waiting-card {
//             background: rgba(255, 255, 255, 0.95);
//             backdrop-filter: blur(20px);
//             border: 1px solid rgba(191, 219, 254, 0.5);
//             border-radius: 20px;
//             padding: 2rem;
//             text-align: center;
//             max-width: 500px;
//             box-shadow: 0 10px 40px rgba(59, 130, 246, 0.1);
//           }
//           .tc__waiting-icon-wrapper {
//             width: 4rem;
//             height: 4rem;
//             background: linear-gradient(135deg, #3b82f6, #1d4ed8);
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             margin: 0 auto 1rem;
//             box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
//           }
//           .tc__waiting-icon {
//             width: 2rem;
//             height: 2rem;
//             color: white;
//           }
//           .tc__waiting-title {
//             font-size: 1.75rem;
//             font-weight: 700;
//             color: #1e40af;
//             margin: 0 0 0.5rem;
//           }
//           .tc__waiting-subtitle {
//             color: #6b7280;
//             margin: 0 0 0.5rem;
//           }
//           .tc__waiting-difficulty {
//             color: #9ca3af;
//             font-size: 0.875rem;
//             margin: 0 0 1.5rem;
//           }
//           .tc__waiting-info {
//             background: linear-gradient(135deg, #eff6ff, #dbeafe);
//             border: 1px solid rgba(147, 197, 253, 0.3);
//             border-radius: 12px;
//             padding: 1rem;
//             margin: 0 0 1.5rem;
//           }
//           .tc__waiting-info-text {
//             color: #1e40af;
//             font-size: 0.875rem;
//             margin: 0 0 0.25rem;
//           }
//           .tc__waiting-info-text:last-child {
//             margin-bottom: 0;
//           }
//           .tc__waiting-instruction {
//             color: #6b7280;
//             font-size: 0.95rem;
//             margin: 0 0 1rem;
//             line-height: 1.5;
//           }
//           .tc__waiting-warning {
//             background: linear-gradient(135deg, #fef3c7, #fde68a);
//             border: 1px solid rgba(245, 158, 11, 0.3);
//             border-radius: 12px;
//             padding: 0.75rem;
//             margin: 0 0 1.5rem;
//           }
//           .tc__waiting-warning-text {
//             color: #92400e;
//             font-size: 0.875rem;
//             margin: 0;
//           }
//           .tc__waiting-button {
//             padding: 1rem 2.5rem;
//             border-radius: 12px;
//             font-weight: 600;
//             font-size: 1.125rem;
//             border: none;
//             cursor: pointer;
//             transition: all 0.3s;
//           }
//           .tc__waiting-button--start {
//             background: linear-gradient(135deg, #10b981, #047857);
//             color: white;
//           }
//           .tc__waiting-button--start:hover {
//             background: linear-gradient(135deg, #059669, #065f46);
//             transform: translateY(-2px);
//             box-shadow: 0 12px 30px rgba(16, 185, 129, 0.3);
//           }
//         `}</style>
//       </div>
//     );
//   }

//   return (
//     <div className="tc__empty-container">
//       <div className="tc__empty-content">
//         <div className="tc__empty-icon-wrapper">
//           <Clock className="tc__empty-icon" />
//         </div>
//         <h2 className="tc__empty-title">No Active Tests</h2>
//         <p className="tc__empty-text">Check back later for new assignments.</p>
        
//         <div className="tc__debug-info">
//           <p className="tc__debug-title"><strong>Debug Info:</strong></p>
//           <p className="tc__debug-item">Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
//           <p className="tc__debug-item">Device ID: {localStorage.getItem('deviceId') || 'Missing'}</p>
//           <p className="tc__debug-item">User ID: {localStorage.getItem('userId') || 'Missing'}</p>
//           <p className="tc__debug-item">Last checked: {new Date().toLocaleTimeString()}</p>
//         </div>
        
//         <button onClick={() => window.location.reload()} className="tc__empty-button">
//           Refresh
//         </button>
//       </div>
//       <style jsx>{`
//         .tc__empty-container {
//           min-height: 100vh;
//           background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//           padding: 1rem;
//         }
//         .tc__empty-content {
//           text-align: center;
//           background: rgba(255, 255, 255, 0.8);
//           backdrop-filter: blur(20px);
//           border: 1px solid rgba(226, 232, 240, 0.5);
//           border-radius: 20px;
//           padding: 2rem;
//           max-width: 500px;
//           box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
//         }
//         .tc__empty-icon-wrapper {
//           width: 4rem;
//           height: 4rem;
//           background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin: 0 auto 1rem;
//         }
//         .tc__empty-icon {
//           width: 2rem;
//           height: 2rem;
//           color: #9ca3af;
//         }
//         .tc__empty-title {
//           font-size: 1.25rem;
//           font-weight: 600;
//           color: #6b7280;
//           margin: 0 0 0.5rem;
//         }
//         .tc__empty-text {
//           color: #9ca3af;
//           margin: 0 0 2rem;
//         }
//         .tc__debug-info {
//           background: linear-gradient(135deg, #f9fafb, #f3f4f6);
//           border: 1px solid rgba(209, 213, 219, 0.5);
//           border-radius: 12px;
//           padding: 1rem;
//           margin: 0 0 1.5rem;
//           text-align: left;
//           font-size: 0.75rem;
//         }
//         .tc__debug-title {
//           color: #374151;
//           margin: 0 0 0.5rem;
//           font-size: 0.75rem;
//         }
//         .tc__debug-item {
//           color: #6b7280;
//           margin: 0.25rem 0;
//           font-size: 0.75rem;
//         }
//         .tc__empty-button {
//           background: linear-gradient(135deg, #3b82f6, #1d4ed8);
//           color: white;
//           padding: 0.75rem 1.5rem;
//           border-radius: 10px;
//           font-weight: 600;
//           border: none;
//           cursor: pointer;
//           transition: all 0.3s;
//         }
//         .tc__empty-button:hover {
//           background: linear-gradient(135deg, #2563eb, #1e40af);
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
//         }

//         @media (max-width: 768px) {
//           .tc__empty-content {
//             padding: 1.5rem;
//           }
//           .tc__waiting-card {
//             padding: 1.5rem;
//           }
//           .tc__result-card {
//             padding: 1.5rem;
//           }
//         }

//         @media (max-width: 480px) {
//           .tc__empty-content,
//           .tc__waiting-card,
//           .tc__result-card,
//           .tc__error-card,
//           .tc__expired-card {
//             padding: 1rem;
//             margin: 0.5rem;
//           }
//           .tc__waiting-button {
//             width: 100%;
//             padding: 1rem;
//           }
//           .tc__result-score {
//             font-size: 2.5rem;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default TestContainer;


// import React, { useState, useEffect, useRef } from 'react';
// import { Clock, AlertTriangle, Send, Lock, Calculator } from 'lucide-react';

// const StudentTestComponent = ({ testId, onTestComplete, socket }) => {
//   const API_URL = 'http://localhost:5000/api';
  
//   const [testData, setTestData] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState([]);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [testStatus, setTestStatus] = useState('loading');
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [violations, setViolations] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [lateJoinTime, setLateJoinTime] = useState(0);
  
//   const testContainerRef = useRef(null);
//   const startTimeRef = useRef(null);
//   const timerRef = useRef(null);
//   const visibilityTimeoutRef = useRef(null);

//   // Generate math questions based on test parameters
//   const generateQuestions = (testType, count, difficultyLevel) => {
//     const questions = [];
    
//     for (let i = 0; i < count; i++) {
//       let question, correctAnswer;
//       let num1, num2;
      
//       // Set difficulty ranges
//       switch (difficultyLevel) {
//         case 'easy':
//           num1 = Math.floor(Math.random() * 10) + 1;
//           num2 = Math.floor(Math.random() * 10) + 1;
//           break;
//         case 'medium':
//           num1 = Math.floor(Math.random() * 50) + 1;
//           num2 = Math.floor(Math.random() * 50) + 1;
//           break;
//         case 'double':
//           num1 = Math.floor(Math.random() * 99) + 1;
//           num2 = Math.floor(Math.random() * 99) + 1;
//           break;
//         default:
//           num1 = Math.floor(Math.random() * 20) + 1;
//           num2 = Math.floor(Math.random() * 20) + 1;
//       }
      
//       // Generate based on test type
//       switch (testType) {
//         case 'multiplication':
//           question = `${num1} × ${num2} = ?`;
//           correctAnswer = (num1 * num2).toString();
//           break;
//         case 'addition':
//           question = `${num1} + ${num2} = ?`;
//           correctAnswer = (num1 + num2).toString();
//           break;
//         case 'subtraction':
//           // Ensure positive result
//           if (num1 < num2) [num1, num2] = [num2, num1];
//           question = `${num1} - ${num2} = ?`;
//           correctAnswer = (num1 - num2).toString();
//           break;
//         case 'division':
//           // Ensure whole number division
//           const product = num1 * num2;
//           question = `${product} ÷ ${num1} = ?`;
//           correctAnswer = num2.toString();
//           break;
//         default:
//           question = `${num1} × ${num2} = ?`;
//           correctAnswer = (num1 * num2).toString();
//       }
      
//       questions.push({
//         question,
//         correctAnswer,
//         type: testType,
//         options: [] // Empty for math problems (text input)
//       });
//     }
    
//     return questions;
//   };

//   // Fetch test data from your existing backend
//   useEffect(() => {
//     const fetchTestData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const deviceId = localStorage.getItem('deviceId');

//         if (!token) {
//           setTestStatus('error');
//           return;
//         }

//         // Fetch the test details first
//         const response = await fetch(`${API_URL}/student/tests/${testId}`, {
//           headers: {
//             'Authorization': token,
//             'X-Device-Id': deviceId,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (!response.ok) {
//           if (response.status === 404) {
//             setTestStatus('no-test');
//             console.warn('Test not found or inactive');
//             return;
//           }
//           throw new Error('Failed to load test');
//         }

//         const testDetails = await response.json();
        
//         // Check if test is still active and not past end time
//         const now = new Date();
//         const testStart = new Date(testDetails.startTime);
//         const testEnd = new Date(testStart.getTime() + (testDetails.duration * 60 * 1000));
        
//         if (now > testEnd) {
//           setTestStatus('test-ended');
//           return;
//         }

//         // Check if student already submitted
//         const userId = localStorage.getItem('userId') || 'anonymous';
//         const existingResult = testDetails.results?.find(r => r.studentId === userId);
//         if (existingResult) {
//           setTestStatus('already-submitted');
//           return;
//         }

//         // Calculate late join time if applicable
//         let adjustedTimeRemaining = testDetails.duration * 60; // Convert to seconds
//         let lateJoinSeconds = 0;
        
//         if (now > testStart) {
//           lateJoinSeconds = Math.floor((now - testStart) / 1000);
//           adjustedTimeRemaining = Math.max(0, adjustedTimeRemaining - lateJoinSeconds);
//           setLateJoinTime(lateJoinSeconds);
//         }

//         // Generate questions if not provided
//         let questions = testDetails.questions || [];
//         if (questions.length === 0) {
//           questions = generateQuestions(
//             testDetails.testType, 
//             testDetails.count, 
//             testDetails.difficultyLevel
//           );
//         }

//         const processedTestData = {
//           ...testDetails,
//           questions,
//           gameType: testDetails.testType // For compatibility
//         };

//         setTestData(processedTestData);
//         setTimeRemaining(adjustedTimeRemaining);
//         setAnswers(new Array(questions.length).fill(''));
//         setTestStatus('active');
//         startTimeRef.current = Date.now();
        
//         // Notify admin via socket
//         socket?.emit('test-started', { 
//           testId: testDetails._id,
//           studentId: userId,
//           lateJoinSeconds
//         });

//       } catch (error) {
//         console.error('Error loading test:', error);
//         setTestStatus('error');
//       }
//     };

//     if (testId) {
//       fetchTestData();
//     }
//   }, [testId, socket, API_URL]);

//   // Enhanced fullscreen handling
//   useEffect(() => {
//     const enterFullscreen = async () => {
//       try {
//         if (testContainerRef.current && !isFullscreen) {
//           if (testContainerRef.current.requestFullscreen) {
//             await testContainerRef.current.requestFullscreen();
//           } else if (testContainerRef.current.webkitRequestFullscreen) {
//             await testContainerRef.current.webkitRequestFullscreen();
//           } else if (testContainerRef.current.msRequestFullscreen) {
//             await testContainerRef.current.msRequestFullscreen();
//           }
//           setIsFullscreen(true);
//         }
//       } catch (error) {
//         console.warn('Fullscreen not supported:', error);
//         // Continue test even without fullscreen
//       }
//     };

//     if (testStatus === 'active' && testContainerRef.current) {
//       enterFullscreen();
//     }
//   }, [testStatus]);

//   // Handle fullscreen changes with stricter enforcement
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       const isCurrentlyFullscreen = Boolean(
//         document.fullscreenElement || 
//         document.webkitFullscreenElement || 
//         document.msFullscreenElement
//       );
//       setIsFullscreen(isCurrentlyFullscreen);
      
//       if (!isCurrentlyFullscreen && testStatus === 'active') {
//         addViolation('Exited fullscreen mode');
        
//         // Try to re-enter fullscreen immediately
//         if (testContainerRef.current) {
//           const enterFullscreen = async () => {
//             try {
//               if (testContainerRef.current.requestFullscreen) {
//                 await testContainerRef.current.requestFullscreen();
//               } else if (testContainerRef.current.webkitRequestFullscreen) {
//                 await testContainerRef.current.webkitRequestFullscreen();
//               }
//             } catch (error) {
//               // If can't re-enter after 3 violations, auto-submit
//               if (violations.length >= 2) {
//                 handleAutoSubmit('Multiple fullscreen violations');
//               }
//             }
//           };
//           enterFullscreen();
//         }
//       }
//     };

//     document.addEventListener('fullscreenchange', handleFullscreenChange);
//     document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
//     document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
//     return () => {
//       document.removeEventListener('fullscreenchange', handleFullscreenChange);
//       document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
//       document.removeEventListener('msfullscreenchange', handleFullscreenChange);
//     };
//   }, [testStatus, violations]);

//   // Enhanced visibility handling
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.hidden && testStatus === 'active') {
//         addViolation('Switched to another tab/window');
        
//         // Shorter timeout for tab switching - 3 seconds
//         visibilityTimeoutRef.current = setTimeout(() => {
//           if (document.hidden) {
//             handleAutoSubmit('Tab switching violation - remained hidden');
//           }
//         }, 3000);
//       } else if (!document.hidden && visibilityTimeoutRef.current) {
//         clearTimeout(visibilityTimeoutRef.current);
//         visibilityTimeoutRef.current = null;
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       if (visibilityTimeoutRef.current) {
//         clearTimeout(visibilityTimeoutRef.current);
//       }
//     };
//   }, [testStatus]);

//   // Enhanced browser navigation prevention
//   useEffect(() => {
//     const handleBeforeUnload = (event) => {
//       if (testStatus === 'active') {
//         event.preventDefault();
//         event.returnValue = 'Your test is in progress. Leaving will auto-submit your test.';
//         return event.returnValue;
//       }
//     };

//     const handlePopState = (event) => {
//       if (testStatus === 'active') {
//         event.preventDefault();
//         window.history.pushState(null, '', window.location.pathname);
//         addViolation('Browser navigation attempt');
//         handleAutoSubmit('Navigation attempt during test');
//       }
//     };

//     // Push current state to prevent back navigation
//     window.history.pushState(null, '', window.location.pathname);
    
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     window.addEventListener('popstate', handlePopState);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       window.removeEventListener('popstate', handlePopState);
//     };
//   }, [testStatus]);

//   // Timer countdown with auto-submit
//   useEffect(() => {
//     if (testStatus === 'active' && timeRemaining > 0) {
//       timerRef.current = setInterval(() => {
//         setTimeRemaining(prev => {
//           if (prev <= 1) {
//             handleAutoSubmit('Time expired');
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);

//       return () => {
//         if (timerRef.current) {
//           clearInterval(timerRef.current);
//         }
//       };
//     }
//   }, [testStatus, timeRemaining]);

//   // Send progress updates to admin
//   useEffect(() => {
//     if (testStatus === 'active' && socket) {
//       const progressInterval = setInterval(() => {
//         const answeredCount = answers.filter(a => a.trim() !== '').length;
//         const progress = (answeredCount / answers.length) * 100;
        
//         socket.emit('test-progress', {
//           testId,
//           studentId: localStorage.getItem('userId') || 'anonymous',
//           progress: Math.round(progress),
//           currentQuestion: currentQuestionIndex + 1,
//           answeredQuestions: answeredCount,
//           timeRemaining
//         });
//       }, 5000);

//       return () => clearInterval(progressInterval);
//     }
//   }, [testStatus, answers, currentQuestionIndex, socket, testId, timeRemaining]);

//   const addViolation = (violation) => {
//     setViolations(prev => {
//       const newViolations = [...prev, {
//         type: violation,
//         timestamp: new Date().toISOString()
//       }];
      
//       // Auto-submit after 3 violations
//       if (newViolations.length >= 3) {
//         setTimeout(() => handleAutoSubmit('Maximum violations exceeded'), 100);
//       }
      
//       return newViolations;
//     });
//   };

//   const handleAutoSubmit = async (reason) => {
//     if (isSubmitting) return;
    
//     console.log(`Auto-submitting test: ${reason}`);
//     await submitTest(true, reason);
//   };

//   const handleAnswerChange = (questionIndex, value) => {
//     const newAnswers = [...answers];
//     newAnswers[questionIndex] = value.trim();
//     setAnswers(newAnswers);
//   };

//   const calculateScore = () => {
//     if (!testData) return { correct: 0, total: 0, score: 0 };
    
//     let correct = 0;
//     testData.questions.forEach((question, index) => {
//       const userAnswer = answers[index]?.trim().toLowerCase();
//       const correctAnswer = question.correctAnswer?.trim().toLowerCase();
      
//       if (userAnswer === correctAnswer) {
//         correct++;
//       }
//     });
    
//     const total = testData.questions.length;
//     const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    
//     return { correct, total, score };
//   };

//   const submitTest = async (isAutoSubmit = false, reason = '') => {
//     if (isSubmitting) return;
    
//     setIsSubmitting(true);
    
//     try {
//       const { correct, total, score } = calculateScore();
//       const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
//       const token = localStorage.getItem('token');
//       const deviceId = localStorage.getItem('deviceId');
//       const userId = localStorage.getItem('userId') || 'anonymous';

//       const submissionData = {
//         studentId: userId,
//         answers: answers.map((answer, index) => ({
//           questionIndex: index,
//           question: testData.questions[index].question,
//           userAnswer: answer,
//           correctAnswer: testData.questions[index].correctAnswer,
//           isCorrect: answer.trim().toLowerCase() === testData.questions[index].correctAnswer.trim().toLowerCase()
//         })),
//         correctCount: correct,
//         totalQuestions: total,
//         score,
//         timeSpent,
//         lateJoinTime,
//         violations,
//         isAutoSubmit,
//         autoSubmitReason: reason,
//         submittedAt: new Date().toISOString()
//       };

//       const response = await fetch(`${API_URL}/student/tests/${testId}/submit`, {
//         method: 'POST',
//         headers: {
//           'Authorization': token,
//           'X-Device-Id': deviceId,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(submissionData)
//       });

//       if (!response.ok) {
//         throw new Error(`Submission failed: ${response.status}`);
//       }

//       // Update performance data if API exists
//       try {
//         const performanceUpdate = {
//           totalGames: 1,
//           totalCorrect: correct,
//           totalScore: score,
//           gameType: testData.testType,
//           difficulty: testData.difficultyLevel || 'medium',
//           speed: 2,
//           count: total
//         };

//         await fetch(`${API_URL}/performance/${userId}`, {
//           method: 'POST',
//           headers: {
//             'Authorization': token,
//             'X-Device-Id': deviceId,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(performanceUpdate)
//         });
//       } catch (perfError) {
//         console.warn('Performance update failed:', perfError);
//         // Continue even if performance update fails
//       }

//       // Notify admin via socket
//       socket?.emit('test-submitted', {
//         testId,
//         studentId: userId,
//         score,
//         correctCount: correct,
//         totalQuestions: total,
//         isAutoSubmit,
//         reason,
//         timeSpent,
//         violations: violations.length
//       });

//       setTestStatus('submitted');

//       // Exit fullscreen
//       if (document.fullscreenElement) {
//         document.exitFullscreen();
//       } else if (document.webkitFullscreenElement) {
//         document.webkitExitFullscreen();
//       } else if (document.msExitFullscreen) {
//         document.msExitFullscreen();
//       }

//       // Call completion callback
//       onTestComplete?.({
//         score,
//         correct,
//         total,
//         isAutoSubmit,
//         reason,
//         timeSpent,
//         violations: violations.length
//       });

//     } catch (error) {
//       console.error('Error submitting test:', error);
      
//       // Fallback: save to localStorage
//       try {
//         const { correct, total, score } = calculateScore();
//         const fallbackData = {
//           testId,
//           score,
//           correct,
//           total,
//           submittedAt: new Date().toISOString(),
//           isAutoSubmit,
//           reason
//         };
        
//         const existingFallbacks = JSON.parse(localStorage.getItem('testSubmissionFallbacks') || '[]');
//         existingFallbacks.push(fallbackData);
//         localStorage.setItem('testSubmissionFallbacks', JSON.stringify(existingFallbacks));
        
//         console.log('Test saved to localStorage as fallback');
//       } catch (localError) {
//         console.error('Error saving fallback:', localError);
//       }
      
//       setTestStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Enhanced keyboard and mouse prevention
//   useEffect(() => {
//     const preventContextMenu = (e) => {
//       if (testStatus === 'active') {
//         e.preventDefault();
//         addViolation('Right-click attempt');
//         return false;
//       }
//     };

//     const preventKeyboardShortcuts = (e) => {
//       if (testStatus === 'active') {
//         // Prevent common shortcuts
//         if (e.ctrlKey || e.metaKey || e.altKey) {
//           e.preventDefault();
//           addViolation('Keyboard shortcut attempt');
//           return false;
//         }
        
//         // Prevent function keys
//         if (e.key.startsWith('F') && e.key.length > 1) {
//           e.preventDefault();
//           addViolation('Function key attempt');
//           return false;
//         }
//       }
//     };

//     const preventSelection = (e) => {
//       if (testStatus === 'active') {
//         e.preventDefault();
//         return false;
//       }
//     };

//     document.addEventListener('contextmenu', preventContextMenu);
//     document.addEventListener('keydown', preventKeyboardShortcuts);
//     document.addEventListener('selectstart', preventSelection);
//     document.addEventListener('dragstart', preventSelection);

//     return () => {
//       document.removeEventListener('contextmenu', preventContextMenu);
//       document.removeEventListener('keydown', preventKeyboardShortcuts);
//       document.removeEventListener('selectstart', preventSelection);
//       document.removeEventListener('dragstart', preventSelection);
//     };
//   }, [testStatus]);

//   // Status screens
//   if (testStatus === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <h2 className="text-xl font-semibold text-gray-700">Loading Test...</h2>
//           <p className="text-gray-500">Preparing your exam questions</p>
//         </div>
//       </div>
//     );
//   }

//   if (testStatus === 'no-test') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg">
//           <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">Test Not Found</h2>
//           <p className="text-gray-500 mb-4">The requested test could not be found or is not available.</p>
//           <button 
//             onClick={() => window.history.back()} 
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (testStatus === 'test-ended') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-yellow-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg">
//           <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">Test Time Expired</h2>
//           <p className="text-gray-500 mb-4">The time limit for this test has already passed.</p>
//           <button 
//             onClick={() => window.history.back()} 
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (testStatus === 'already-submitted') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-green-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg">
//           <Send className="h-16 w-16 text-green-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">Test Already Submitted</h2>
//           <p className="text-gray-500 mb-4">You have already completed this test successfully.</p>
//           <button 
//             onClick={() => window.history.back()} 
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (testStatus === 'error') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-red-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg">
//           <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">Test Error</h2>
//           <p className="text-gray-500 mb-4">Unable to load or submit the test. Please contact your teacher.</p>
//           <div className="space-x-2">
//             <button 
//               onClick={() => window.location.reload()} 
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Try Again
//             </button>
//             <button 
//               onClick={() => window.history.back()} 
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               Go Back
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (testStatus === 'submitted') {
//     const { correct, total, score } = calculateScore();
    
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-green-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Send className="h-8 w-8 text-green-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Submitted Successfully!</h2>
//           <p className="text-gray-600 mb-6">Your test has been submitted and saved.</p>
          
//           <div className="bg-gray-50 rounded-lg p-4 mb-6">
//             <div className="text-3xl font-bold text-blue-600 mb-2">{score}%</div>
//             <div className="text-sm text-gray-600">
//               {correct} out of {total} questions correct
//             </div>
//           </div>
          
//           {lateJoinTime > 0 && (
//             <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
//               <p className="text-sm text-blue-800">
//                 You joined {Math.floor(lateJoinTime / 60)}:{(lateJoinTime % 60).toString().padStart(2, '0')} late
//               </p>
//             </div>
//           )}
          
//           {violations.length > 0 && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
//               <p className="text-sm text-yellow-800">
//                 Security violations recorded: {violations.length}
//               </p>
//             </div>
//           )}
          
//           <button
//             onClick={() => window.history.back()}
//             className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//           >
//             Continue
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!testData) return null;

//   const currentQuestion = testData.questions[currentQuestionIndex];
//   const progress = ((currentQuestionIndex + 1) / testData.questions.length) * 100;

//   return (
//     <div 
//       ref={testContainerRef}
//       className="min-h-screen bg-gray-50 flex flex-col"
//       style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
//     >
//       {/* Security Status Bar */}
//       <div className="bg-red-600 text-white px-4 py-2 text-sm flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Lock className="h-4 w-4" />
//           <span>EXAM MODE - Do not close window, switch tabs, or use keyboard shortcuts</span>
//         </div>
//         <div className="flex items-center gap-4">
//           {lateJoinTime > 0 && (
//             <span className="bg-blue-800 px-2 py-1 rounded text-xs">
//               Late: +{Math.floor(lateJoinTime / 60)}:{(lateJoinTime % 60).toString().padStart(2, '0')}
//             </span>
//           )}
//           {violations.length > 0 && (
//             <span className="bg-red-800 px-2 py-1 rounded text-xs">
//               {violations.length} violation(s)
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Timer and Progress Header */}
//       <div className="bg-white shadow-sm border-b px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//               <Calculator className="h-5 w-5" />
//               {testData.testType.charAt(0).toUpperCase() + testData.testType.slice(1)} Test
//               <span className="text-sm font-normal text-gray-500">
//                 ({testData.difficultyLevel})
//               </span>
//             </h1>
//             <p className="text-sm text-gray-600">
//               Question {currentQuestionIndex + 1} of {testData.questions.length}
//             </p>
//           </div>
          
//           <div className="text-right">
//             <div className={`text-2xl font-bold ${
//               timeRemaining < 60 ? 'text-red-600 animate-pulse' : 
//               timeRemaining < 300 ? 'text-orange-600' : 'text-blue-600'
//             }`}>
//               <Clock className="inline h-6 w-6 mr-2" />
//               {formatTime(timeRemaining)}
//             </div>
//             <p className="text-sm text-gray-500">Time remaining</p>
//           </div>
//         </div>
        
//         {/* Progress Bar */}
//         <div className="mt-4">
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div 
//               className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             ></div>
//           </div>
//         </div>
//       </div>

//       {/* Question Content */}
//       <div className="flex-1 flex items-center justify-center p-6">
//         <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
//           <div className="mb-6">
//             <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//               {currentQuestion.question}
//             </h2>
            
//             {/* Answer Input */}
//             <div className="space-y-4">
//               {currentQuestion.options && currentQuestion.options.length > 0 ? (
//                 // Multiple choice
//                 <div className="space-y-3">
//                   {currentQuestion.options.map((option, index) => (
//                     <label 
//                       key={index}
//                       className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
//                     >
//                       <input
//                         type="radio"
//                         name={`question-${currentQuestionIndex}`}
//                         value={option}
//                         checked={answers[currentQuestionIndex] === option}
//                         onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
//                         className="mr-3"
//                       />
//                       <span className="text-lg">{option}</span>
//                     </label>
//                   ))}
//                 </div>
//               ) : (
//                 // Text input for math problems
//                 <div>
//                   <input
//                     type="text"
//                     value={answers[currentQuestionIndex]}
//                     onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
//                     className="w-full p-6 text-2xl border-2 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono"
//                     placeholder="Enter your answer"
//                     autoFocus
//                     onKeyPress={(e) => {
//                       // Allow only numbers and basic math symbols
//                       const allowedChars = /[0-9\-+.]/;
//                       if (!allowedChars.test(e.key) && e.key !== 'Backspace' && e.key !== 'Enter') {
//                         e.preventDefault();
//                       }
//                       // Submit on Enter if it's the last question
//                       if (e.key === 'Enter' && currentQuestionIndex === testData.questions.length - 1) {
//                         submitTest(false);
//                       }
//                     }}
//                   />
//                   <p className="text-sm text-gray-500 mt-2 text-center">
//                     Enter numbers only. Press Enter to move to next question.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Navigation Buttons */}
//           <div className="flex justify-between items-center">
//             <button
//               onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
//               disabled={currentQuestionIndex === 0}
//               className="px-6 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
//             >
//               Previous
//             </button>

//             <span className="text-gray-500">
//               {answers.filter(a => a.trim() !== '').length} of {testData.questions.length} answered
//             </span>

//             {currentQuestionIndex < testData.questions.length - 1 ? (
//               <button
//                 onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Next
//               </button>
//             ) : (
//               <button
//                 onClick={() => submitTest(false)}
//                 disabled={isSubmitting}
//                 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                     Submitting...
//                   </>
//                 ) : (
//                   <>
//                     <Send className="h-4 w-4" />
//                     Submit Test
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Question Navigation Footer */}
//       <div className="bg-white border-t px-6 py-4">
//         <div className="flex flex-wrap gap-2 justify-center">
//           {testData.questions.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentQuestionIndex(index)}
//               className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
//                 index === currentQuestionIndex
//                   ? 'bg-blue-600 text-white'
//                   : answers[index]?.trim()
//                   ? 'bg-green-100 text-green-800 border border-green-300'
//                   : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
//               }`}
//             >
//               {index + 1}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Warning Modal for Violations */}
//       {violations.length > 0 && violations.length % 2 === 1 && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="h-8 w-8 text-red-500" />
//               <h3 className="text-lg font-bold text-red-800">Security Violation Detected</h3>
//             </div>
//             <p className="text-gray-700 mb-4">
//               You have attempted to leave the test environment or use prohibited features. 
//               This violation has been recorded.
//             </p>
//             <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
//               <p className="text-sm text-red-800">
//                 <strong>Latest Violation:</strong> {violations[violations.length - 1]?.type}
//               </p>
//               <p className="text-sm text-red-600 mt-1">
//                 Total violations: {violations.length}
//               </p>
//               {violations.length >= 2 && (
//                 <p className="text-sm text-red-700 mt-2 font-semibold">
//                   Warning: One more violation will auto-submit your test!
//                 </p>
//               )}
//             </div>
//             <div className="text-right">
//               <button
//                 onClick={() => {
//                   // Modal will auto-close, violation is already recorded
//                 }}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//               >
//                 Continue Test
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Enhanced Test Container Component
// // Fixed TestContainer component in StudentTestComponent.js

// // Enhanced Test Container Component
// const TestContainer = ({ studentId, socket }) => {
//   const API_URL = 'http://localhost:5000/api';
//   const [activeTest, setActiveTest] = useState(null);
//   const [showTest, setShowTest] = useState(false);
//   const [testResult, setTestResult] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Check for active tests using your existing API structure
//   useEffect(() => {
//     const checkForActiveTests = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const token = localStorage.getItem('token');
//         const deviceId = localStorage.getItem('deviceId');
        
//         if (!token) {
//           console.log('No token found');
//           setError('No authentication token found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         console.log('Checking for active tests...');
//         console.log('Token:', token ? 'Present' : 'Missing');
//         console.log('Device ID:', deviceId);

//         // Check for active tests that target this student
//         const response = await fetch(`${API_URL}/student/tests/active`, {
//           method: 'GET',
//           headers: {
//             'Authorization': token,
//             'X-Device-Id': deviceId,
//             'Content-Type': 'application/json'
//           }
//         });

//         console.log('Response status:', response.status);
        
//         if (!response.ok) {
//           if (response.status === 401) {
//             setError('Authentication failed. Please log in again.');
//             return;
//           } else if (response.status === 403) {
//             setError('Access denied. Please contact your teacher.');
//             return;
//           }
//           throw new Error(`Failed to fetch tests: ${response.status}`);
//         }

//         const tests = await response.json();
//         console.log('Received tests:', tests);
        
//         if (tests && tests.length > 0) {
//           // Filter tests that are actually active and not expired
//           const currentTime = new Date();
//           const availableTests = tests.filter(test => {
//             const testStart = new Date(test.startTime);
//             const testEnd = new Date(testStart.getTime() + (test.duration * 60 * 1000));
            
//             console.log('Test:', test._id);
//             console.log('Current time:', currentTime);
//             console.log('Test start:', testStart);
//             console.log('Test end:', testEnd);
//             console.log('Is active:', currentTime >= testStart && currentTime < testEnd);
            
//             return currentTime >= testStart && currentTime < testEnd;
//           });
          
//           if (availableTests.length > 0) {
//             console.log('Setting active test:', availableTests[0]);
//             setActiveTest(availableTests[0]);
//           } else {
//             console.log('No available tests (all expired or not yet started)');
//           }
//         } else {
//           console.log('No tests found');
//         }
//       } catch (error) {
//         console.error('Error checking for active tests:', error);
//         setError(`Error loading tests: ${error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkForActiveTests();

//     // Check every 30 seconds for new tests
//     const interval = setInterval(checkForActiveTests, 30000);
//     return () => clearInterval(interval);
//   }, [API_URL]);

//   // Listen for test events from admin (if socket is available)
//   useEffect(() => {
//     if (socket) {
//       const handleTestLaunched = (testData) => {
//         console.log('Test launched event received:', testData);
//         setActiveTest(testData);
//       };

//       const handleTestEnded = (data) => {
//         console.log('Test ended event received:', data);
//         if (activeTest && activeTest._id === data.testId) {
//           setActiveTest(null);
//           setShowTest(false);
//         }
//       };

//       socket.on('test-launched', handleTestLaunched);
//       socket.on('test-ended', handleTestEnded);

//       return () => {
//         socket.off('test-launched', handleTestLaunched);
//         socket.off('test-ended', handleTestEnded);
//       };
//     }
//   }, [socket, activeTest]);

//   const handleStartTest = () => {
//     console.log('Starting test:', activeTest);
//     setShowTest(true);
//   };

//   const handleTestComplete = (result) => {
//     console.log('Test completed:', result);
//     setTestResult(result);
//     setShowTest(false);
//     setActiveTest(null);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking for active tests...</p>
//           <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-red-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
//           <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <div className="space-x-2">
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Retry
//             </button>
//             <button
//               onClick={() => setError(null)}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               Dismiss
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (showTest && activeTest) {
//     return (
//       <StudentTestComponent
//         testId={activeTest._id || activeTest.id}
//         onTestComplete={handleTestComplete}
//         socket={socket}
//       />
//     );
//   }

//   if (testResult) {
//     return (
//       <div className="min-h-screen bg-green-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Complete!</h2>
//           <div className="text-6xl font-bold text-blue-600 mb-4">{testResult.score}%</div>
//           <p className="text-gray-600 mb-6">
//             You answered {testResult.correct} out of {testResult.total} questions correctly.
//           </p>
//           {testResult.isAutoSubmit && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
//               <p className="text-sm text-yellow-800">
//                 <strong>Note:</strong> Test was auto-submitted due to: {testResult.reason}
//               </p>
//             </div>
//           )}
//           {testResult.violations > 0 && (
//             <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
//               <p className="text-sm text-red-800">
//                 <strong>Security Violations:</strong> {testResult.violations} recorded
//               </p>
//             </div>
//           )}
//           <button
//             onClick={() => setTestResult(null)}
//             className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//           >
//             Continue
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (activeTest) {
//     const now = new Date();
//     const testStart = new Date(activeTest.startTime);
//     const testEnd = new Date(testStart.getTime() + (activeTest.duration * 60 * 1000));
//     const isTestTime = now >= testStart && now < testEnd;
//     const isTestOver = now >= testEnd;
    
//     console.log('Active test found:', {
//       testId: activeTest._id,
//       now: now.toISOString(),
//       start: testStart.toISOString(),
//       end: testEnd.toISOString(),
//       isTestTime,
//       isTestOver
//     });
    
//     if (isTestOver) {
//       return (
//         <div className="min-h-screen bg-red-50 flex items-center justify-center">
//           <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
//             <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Expired</h2>
//             <p className="text-gray-600 mb-4">
//               The time limit for this test has passed.
//             </p>
//             <button 
//               onClick={() => setActiveTest(null)} 
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Continue
//             </button>
//           </div>
//         </div>
//       );
//     }
    
//     return (
//       <div className="min-h-screen bg-blue-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
//           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Calculator className="h-8 w-8 text-blue-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Available</h2>
//           <p className="text-gray-600 mb-4">
//             {activeTest.testType.charAt(0).toUpperCase() + activeTest.testType.slice(1)} • {activeTest.duration} minutes • {activeTest.count} questions
//           </p>
//           <p className="text-sm text-gray-500 mb-4">
//             Difficulty: {activeTest.difficultyLevel}
//           </p>
          
//           <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
//             <p className="text-sm text-blue-800">
//               <strong>Test ID:</strong> {activeTest._id}
//             </p>
//             <p className="text-sm text-blue-800">
//               <strong>Started:</strong> {testStart.toLocaleString()}
//             </p>
//           </div>
          
//           {isTestTime ? (
//             <>
//               <p className="text-sm text-gray-500 mb-6">
//                 Click below to start your test. Ensure you're in a quiet environment with stable internet.
//               </p>
//               <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
//                 <p className="text-sm text-yellow-800">
//                   <strong>Important:</strong> Test will run in fullscreen mode. Do not switch tabs or use keyboard shortcuts.
//                 </p>
//               </div>
//               <button
//                 onClick={handleStartTest}
//                 className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium"
//               >
//                 Start Test
//               </button>
//             </>
//           ) : (
//             <>
//               <p className="text-sm text-gray-500 mb-4">
//                 Test starts at: {testStart.toLocaleString()}
//               </p>
//               <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
//                 <p className="text-sm text-yellow-800">
//                   Please wait for the scheduled start time.
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Clock className="h-8 w-8 text-gray-400" />
//         </div>
//         <h2 className="text-xl text-gray-600">No Active Tests</h2>
//         <p className="text-gray-500 mt-2">Check back later for new assignments.</p>
        
//         {/* Debug info */}
//         <div className="mt-6 p-4 bg-gray-100 rounded text-xs text-left max-w-md">
//           <p><strong>Debug Info:</strong></p>
//           <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
//           <p>Device ID: {localStorage.getItem('deviceId') || 'Missing'}</p>
//           <p>User ID: {localStorage.getItem('userId') || 'Missing'}</p>
//           <p>Last checked: {new Date().toLocaleTimeString()}</p>
//         </div>
        
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Refresh
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TestContainer;