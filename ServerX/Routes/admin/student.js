// Fixed student.js
const express = require('express');
const studentRouter = express.Router();
const { authenticateUser } = require("../../middleware/authentication");

const User = require('../../models/user');
const Performance = require('../../models/Performance');
const Test = require('../../models/Test');
const Announcement = require('../../models/Announcement');
const Group = require('../../models/Group');

// Get active tests for student - FIXED VERSION
studentRouter.get('/tests/active', authenticateUser, async (req, res) => {
  try {
    console.log('Student requesting active tests:',  req._id);
    
    // Get the actual user ID from the authenticated request
    const userId = req.user._id;
    
    // Find the user to get their ObjectId if needed
    let userObjectId = userId;
    if (typeof userId === 'string' && !userId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findById(userId) ;
      if (user) {
        userObjectId =  req.user._id;
      }
    }

    console.log('Looking for tests targeting user:', userObjectId);

    // Find active tests - more flexible matching
    const activeTests = await Test.find({
      status: 'active',
      startTime: { $lte: new Date() },
      $or: [
        { targetStudents: { $size: 0 } }, // Empty array means all students
        { targetStudents: userObjectId },
        { targetStudents: userId },
        { targetStudents: { $in: [userObjectId, userId] } }
      ]
    });

    console.log('Found active tests:', activeTests.length);
    
    // Filter out tests where user already submitted
    const availableTests = activeTests.filter(test => {
      const existingSubmission = test.results.find(
        r => r.studentId.toString() === userObjectId.toString() || 
             r.studentId.toString() === userId.toString()
      );
      return !existingSubmission || existingSubmission.status !== 'submitted';
    });

    console.log('Available tests after filtering submissions:', availableTests.length);

    res.json(availableTests);
  } catch (error) {
    console.error('Error fetching active tests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get test questions (only when test is active) - FIXED VERSION
studentRouter.get('/tests/:testId', authenticateUser, async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    
    if (!test || test.status !== 'active') {
      return res.status(404).json({ error: 'Test not found or inactive' });
    }

    const userId = req.user._id;
    console.log('User requesting test:', userId, 'Test targets:', test.targetStudents);

    // More flexible authorization check
    let userObjectId = userId;
    if (typeof userId === 'string' && !userId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ userId: userId });
      if (user) {
        userObjectId = user._id;
      }
    }

    // Check authorization - allow if targetStudents is empty (all students) or user is in the list
    const isAuthorized = test.targetStudents.length === 0 || 
                        test.targetStudents.some(id => 
                          id.toString() === userObjectId.toString() || 
                          id.toString() === userId.toString()
                        );

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized for this test' });
    }

    // Check if student already submitted
    const existingSubmission = test.results.find(
      r => r.studentId.toString() === userObjectId.toString() || 
           r.studentId.toString() === userId.toString()
    );

    if (existingSubmission && existingSubmission.status === 'submitted') {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    // Generate questions if empty (as shown in your frontend code)
    let questions = test.questions || [];
    if (questions.length === 0) {
      questions = generateQuestions(test.testType, test.count, test.difficultyLevel);
    }

    res.json({
      _id: test._id,
      testType: test.testType,
      difficultyLevel: test.difficultyLevel,
      duration: test.duration,
      count: test.count,
      startTime: test.startTime,
      questions: questions.map(q => ({
        question: q.question,
        correctAnswer: q.correctAnswer, // Include this for the frontend logic
        type: q.type,
        options: q.options || []
      }))
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate questions (matching your frontend logic)
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

// Get announcements for student
// studentRouter.get('/announcements', authenticateUser, async (req, res) => {
//   try {
//     const userId = req.userId || req._id;
//     const user = await User.findOne({ $or: [{ _id: userId }, { userId: userId }] });
    
//     const announcements = await Announcement.find({
//       $or: [
//         { targetGroup: 'all' },
//         { targetGroup: user?.group }
//       ]
//     }).sort({ createdAt: -1 });

//     res.json(announcements);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Mark announcement as read
studentRouter.post('/announcements/:id/read', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId || req._id;
    
    await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          readBy: {
            studentId: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Announcement marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// studentRouter.post('/tests/:testId/submit', async (req, res) => {
//   try {
//     const { studentId, answers, correctCount, totalQuestions, score } = req.body;
    
//     const test = await Test.findById(req.params.testId);
//     if (!test) {
//       return res.status(404).json({ error: 'Test not found' });
//     }

//     // Add result to test
//     const resultIndex = test.results.findIndex(r => r.studentId.toString() === studentId);
//     const result = {
//       studentId,
//       answers,
//       correctCount,
//       totalQuestions,
//       score,
//       submittedAt: new Date(),
//       status: 'submitted'
//     };

//     if (resultIndex >= 0) {
//       test.results[resultIndex] = result;
//     } else {
//       test.results.push(result);
//     }

//     await test.save();

//     // Update student's performance record
//     await Performance.findOneAndUpdate(
//       { userId: studentId },
//       {
//         $inc: {
//           totalGames: 1,
//           totalCorrect: correctCount,
//           totalScore: score
//         },
//         $push: {
//           history: {
//             date: new Date(),
//             gameType: 'Test',
//             score,
//             correct: correctCount,
//             total: totalQuestions
//           }
//         }
//       }
//     );

//     res.json({ message: 'Test submitted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// End active test


// studentRouter.post('/tests/:testId/submit', async (req, res) => {
//   try {
//     const { studentId, answers, correctCount, totalQuestions, score } = req.body;
    
//     const result = {
//       studentId,
//       answers,
//       correctCount,
//       totalQuestions,
//       score,
//       submittedAt: new Date(),
//       status: 'submitted'
//     };

//     testResults.push(result);

//     // Update student's performance data with test result
//     const performance = await getPerformanceData(studentId);
//     if (performance) {
//       performance.totalGames += 1;
//       performance.totalCorrect += correctCount;
//       performance.totalScore += score;
      
//       // Add to history
//       if (!performance.history) performance.history = [];
//       performance.history.push({
//         date: new Date(),
//         gameType: 'Test',
//         score,
//         correct: correctCount,
//         total: totalQuestions,
//         timestamp: new Date()
//       });

//       await savePerformanceData(studentId, performance);
//     }

//     res.json({ message: 'Test submitted successfully' });
//   } catch (error) {
//     console.error('Error submitting test:', error);
//     res.status(500).json({ error: 'Failed to submit test' });
//   }
// });

// Submit test result and update performance
// studentRouter.post('/tests/:testId/submit', async (req, res) => {
//   try {
//     const { studentId, answers, correctCount, totalQuestions, score } = req.body;

//     // 1. Find the test
//     const test = await Test.findById(req.params.testId);
//     if (!test) {
//       return res.status(404).json({ error: 'Test not found' });
//     }

//     // 2. Prepare result object
//     const result = {
//       studentId,
//       answers,
//       correctCount,
//       totalQuestions,
//       score,
//       submittedAt: new Date(),
//       status: 'submitted'
//     };

//     // 3. Save result into test (update if student already submitted)
//     const resultIndex = test.results.findIndex(r => r.studentId.toString() === studentId);
//     if (resultIndex >= 0) {
//       test.results[resultIndex] = result;
//     } else {
//       test.results.push(result);
//     }
//     await test.save();

//     // 4. Update student performance
//     const todayKey = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

//     await Performance.findOneAndUpdate(
//       { userId: studentId },
//       {
//         $inc: {
//           totalGames: 1,
//           totalCorrect: correctCount,
//           totalScore: score,
//           "gameTypes.Test.plays": 1,
//           "gameTypes.Test.correct": correctCount,
//           "gameTypes.Test.score": score,
//           [`dailyStats.${todayKey}.plays`]: 1,
//           [`dailyStats.${todayKey}.correct`]: correctCount,
//           [`dailyStats.${todayKey}.score`]: score,
//           [`dailyStats.${todayKey}.gameTypes.Test.plays`]: 1,
//           [`dailyStats.${todayKey}.gameTypes.Test.correct`]: correctCount,
//           [`dailyStats.${todayKey}.gameTypes.Test.score`]: score,
//         },
//         $push: {
//           history: {
//             date: todayKey,
//             timestamp: new Date(),
//             gameType: "Test",
//             score,
//             correct: correctCount,
//             total: totalQuestions,
//             maxScore: totalQuestions // optional
//           }
//         },
//         $set: { updatedAt: new Date() }
//       },
//       { upsert: true, new: true } // create if not exists
//     );

//     res.json({ message: 'Test submitted successfully' });

//   } catch (error) {
//     console.error('Error submitting test:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// Submit test
// ✅ OPTIMIZED: Submit test with timeout handling
studentRouter.post('/tests/:testId/submit', authenticateUser, async (req, res) => {
  // Set timeout to 25 seconds (less than gateway timeout)
  req.setTimeout(25000);
  
  try {
    const { testId } = req.params;
    const { 
      answers, 
      correctCount, 
      totalQuestions, 
      score,
      timeSpent,
      lateJoinTime,
      violations,
      isAutoSubmit,
      autoSubmitReason,
      submittedAt
    } = req.body;

    console.log(`📝 Submission received for test ${testId} from user ${req.user._id}`);

    // ✅ Quick validation
    if (!testId || !req.user._id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ Find test without population (faster)
    const test = await Test.findById(testId).lean();
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // ✅ Quick check if already submitted
    const existingResult = test.results?.find(
      r => r.studentId.toString() === req.user._id.toString()
    );

    if (existingResult && existingResult.status === 'submitted') {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    // ✅ Prepare submission data (minimal)
    const submissionData = {
      studentId: req.user._id,
      answers: answers || [],
      correctCount: correctCount || 0,
      totalQuestions: totalQuestions || test.count,
      score: score || 0,
      timeSpent: timeSpent || 0,
      lateJoinTime: lateJoinTime || 0,
      violations: violations || [],
      isAutoSubmit: isAutoSubmit || false,
      autoSubmitReason: autoSubmitReason || '',
      submittedAt: submittedAt || new Date(),
      status: 'submitted'
    };

    // ✅ Update test (atomic operation)
    await Test.findByIdAndUpdate(
      testId,
      { 
        $push: { results: submissionData }
      },
      { new: false } // Don't return updated doc (faster)
    );

    console.log(`✅ Test submission saved for user ${req.user._id}`);

    // ✅ Send response FIRST before updating performance
    res.json({
      message: 'Test submitted successfully',
      score,
      correctCount,
      totalQuestions,
      submissionId: 'pending'
    });

    // ✅ Update performance AFTER response (non-blocking)
    setImmediate(async () => {
      try {
        await updateStudentPerformance(req.user._id, {
          testType: test.testType,
          score,
          correctCount,
          totalQuestions,
          timeSpent
        });
        console.log(`✅ Performance updated for user ${req.user._id}`);
      } catch (perfError) {
        console.error('⚠️ Performance update failed (non-critical):', perfError);
      }
    });

  } catch (error) {
    console.error('❌ Error submitting test:', error);
    
    // ✅ Handle timeout specifically
    if (error.name === 'TimeoutError') {
      return res.status(504).json({ 
        error: 'Submission timeout',
        message: 'Please try again'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit test',
      message: error.message 
    });
  }
});

// ✅ Helper function to update performance (non-blocking)
async function updateStudentPerformance(userId, data) {
  try {
    let performance = await Performance.findOne({ userId });
    
    if (!performance) {
      performance = new Performance({
        userId,
        totalGames: 0,
        totalCorrect: 0,
        totalScore: 0,
        gameTypes: {},
        history: []
      });
    }

    // Update stats
    performance.totalGames += 1;
    performance.totalCorrect += data.correctCount;
    performance.totalScore += data.score;

    // Update game type stats
    if (!performance.gameTypes[data.testType]) {
      performance.gameTypes[data.testType] = {
        plays: 0,
        correct: 0,
        score: 0
      };
    }
    
    performance.gameTypes[data.testType].plays += 1;
    performance.gameTypes[data.testType].correct += data.correctCount;
    performance.gameTypes[data.testType].score += data.score;

    // Add to history (limit to last 100)
    performance.history.unshift({
      date: new Date(),
      gameType: data.testType,
      score: data.score,
      correct: data.correctCount,
      total: data.totalQuestions,
      timeSpent: data.timeSpent
    });

    if (performance.history.length > 100) {
      performance.history = performance.history.slice(0, 100);
    }

    await performance.save();
  } catch (error) {
    console.error('Performance update error:', error);
    throw error;
  }
}



studentRouter.put('/tests/:testId/end', async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      // req.params.testId,
      { 
        status: 'completed',
        endTime: new Date()
      },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ message: 'Test ended successfully', test });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test history
studentRouter.get('/tests/history', async (req, res) => {
  try {
    const tests = await Test.find({ 
      createdBy: req.admin._id,
      status: 'completed'
    }).sort({ createdAt: -1 }).limit(20);

    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = studentRouter;