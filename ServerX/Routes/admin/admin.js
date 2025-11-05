// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const Performance = require('../../models/Performance');
const Test = require('../../models/Test');
const Announcement = require('../../models/Announcement');
const Group = require('../../models/Group');
const cron = require('node-cron')

// Middleware to verify admin/teacher role
const verifyAdmin = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
  try {
  

  const decoded = jwt.decode(token);
  const userId = decoded.userId;
    const user = await User.findOne({ userId });
    
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.admin = user;
    req.userId = decoded.userId;
    req.ByPhoneNumber =  decoded.mobileNumber
    next();
  } catch (error) {
    res.status(409).json({ error: 'Invalid token' });
  }
};

// Apply admin verification to all routes
router.use(verifyAdmin);

// =====================
// STUDENT MANAGEMENT
// =====================

// Get all students
router.get('/students', async (req, res) => {
  try {
    const { search, group } = req.query;
    let query = { role: 'student' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (group && group !== 'all') {
      query.group = group;
    }

    const students = await User.find(query).select('-password');
    
    // Get performance data for each student
    const studentsWithPerformance = await Promise.all(
      students.map(async (student) => {
        const performance = await Performance.findOne({ userId: student._id });
        return {
          ...student.toObject(),
          performance: performance || {
            totalGames: 0,
            totalCorrect: 0,
            totalScore: 0,
            accuracy: 0
          }
        };
      })
    );
    console.log('Fetched students with performance:', studentsWithPerformance);

    res.json(studentsWithPerformance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student details
router.get('/students/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const performance = await Performance.findOne({ userId: student._id });
    const recentTests = await Test.find({ 
      'results.studentId': student._id 
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      ...student.toObject(),
      performance: performance || {
        totalGames: 0,
        totalCorrect: 0,
        totalScore: 0,
        gameTypes: {},
        history: []
      },
      recentTests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student
// router.post('/students', async (req, res) => {
//   try {
//     const { name, email, password, group } = req.body;
    
//     // Check if email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Email already exists' });
//     }

//     const student = new User({
//       name,
//       email,
//       password, // Should be hashed
//       role: 'student',
//       group,
//       createdBy: req.admin._id
//     });

//     await student.save();
    
//     // Initialize performance record
//     const performance = new Performance({
//       userId: student._id,
//       totalGames: 0,
//       totalCorrect: 0,
//       totalScore: 0,
//       gameTypes: {},
//       dailyStats: {},
//       history: []
//     });
    
//     await performance.save();

//     res.status(201).json({ message: 'Student created successfully', studentId: student._id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update student
// router.put('/students/:id', async (req, res) => {
//   try {
//     const { name, email, group } = req.body;
    
//     const student = await User.findByIdAndUpdate(
//       req.params.id,
//       { name, email, group },
//       { new: true }
//     ).select('-password');

//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     res.json(student);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete student
// router.delete('/students/:id', async (req, res) => {
//   try {
//     const student = await User.findByIdAndDelete(req.params.id);
//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     // Also delete associated performance data
//     await Performance.findOneAndDelete({ userId: req.params.id });

//     res.json({ message: 'Student deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// =====================
// GROUP MANAGEMENT
// =====================

// Get all groups
router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.admin._id });
    
    // Calculate student count and average score for each group
    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
        const students = await User.find({ group: group.name, role: 'student' });
        const performances = await Performance.find({ 
          userId: { $in: students.map(s => s._id) } 
        });
        
        const avgScore = performances.length > 0 
          ? performances.reduce((sum, p) => sum + (p.totalScore || 0), 0) / performances.length
          : 0;

        return {
          ...group.toObject(),
          studentCount: students.length,
          avgScore: Math.round(avgScore * 100) / 100
        };
      })
    );

    res.json(groupsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new group
router.post('/groups', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const group = new Group({
      name,
      description,
      createdBy: req.admin._id
    });

    await group.save();
    res.status(201).json({ message: 'Group created successfully', groupId: group._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// TEST MANAGEMENT
// =====================

// Create and launch test
router.post('/tests/launch', async (req, res) => {
  try {
    const { count, difficulty, duration, startOption, targetStudents, gameType, questions } = req.body;

    const test = new Test({
      createdBy: req.admin._id,
      testType: gameType || "general",
      duration,
      count: count || questions.length,
      questions,
      difficultyLevel:difficulty || 'single',
      startTime: startOption === 'immediate' 
        ? new Date() 
        : new Date(Date.now() + 2 * 60000), 
      status: 'active',
      targetStudents: targetStudents === 'all' 
        ? await User.find({ role: 'student' }).distinct('_id')
        : await User.find({ role: 'student', group: targetStudents }).distinct('_id'),
      results: []
    });

    await test.save();

    res.status(201).json({ 
      message: 'Test launched successfully', 
      testId: test._id,
      test 
    });
  } catch (error) {
    console.error("🚨 Error launching test:", error);  // full log
    res.status(500).json({ error: error.message });
  }
});

// Backend API route - Update your test-results endpoint
router.get('/tests/test-results', async (req, res) => {
  try {
    const tests = await Test.find({ 
      createdBy: req.admin._id,
      status: 'completed'
    })
    .populate('results.studentId', 'name email')
    .sort({ createdAt: -1 })
    .limit(20);

    // Process each test to calculate proper time spent
    const processedTests = tests.map(test => {
      const testData = test.toObject();
      
      // Calculate proper time for each student result
      if (testData.results && testData.results.length > 0) {
        testData.results = testData.results.map(result => {
          let timeSpentInSeconds = 0;
          
          if (result.submittedAt && testData.startTime) {
            // Calculate time spent from test start to submission
            const testStartTime = new Date(testData.startTime);
            const studentSubmitTime = new Date(result.submittedAt);
            timeSpentInSeconds = Math.floor((studentSubmitTime - testStartTime) / 1000);
            
            // Ensure time is not negative or greater than test duration
            const maxTimeInSeconds = testData.duration * 60;
            timeSpentInSeconds = Math.max(0, Math.min(timeSpentInSeconds, maxTimeInSeconds));
          }
          
          return {
            ...result,
            timeSpent: timeSpentInSeconds,
            studentName: result.studentId?.name || 'Unknown Student'
          };
        });

        // Calculate average score for the test
        const validScores = testData.results.filter(r => r.score !== undefined).map(r => r.score);
        testData.averageScore = validScores.length > 0 
          ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
          : 0;
      }
      
      return testData;
    });

    res.json(processedTests);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: error.message });
  }
});


// Helper function to format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update your test submission endpoint to ensure submittedAt is set
router.post('/tests/:testId/submit', async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body;
    const studentId = req.user._id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check if test is still active
    if (test.status !== 'active') {
      return res.status(400).json({ error: 'Test is not active' });
    }

    // Process answers and calculate score
    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
      const isCorrect = answer.userAnswer?.toString() === answer.correctAnswer?.toString();
      if (isCorrect) correctCount++;
      
      return {
        questionIndex: index,
        question: answer.question,
        userAnswer: answer.userAnswer || "",
        correctAnswer: answer.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / answers.length) * 100);

    // Find existing result or create new one
    let existingResultIndex = test.results.findIndex(
      result => result.studentId.toString() === studentId.toString()
    );

    const submissionData = {
      studentId,
      answers: processedAnswers,
      correctCount,
      totalQuestions: answers.length,
      score,
      submittedAt: new Date(), // This is crucial for time calculation
      status: 'submitted'
    };

    if (existingResultIndex >= 0) {
      test.results[existingResultIndex] = submissionData;
    } else {
      test.results.push(submissionData);
    }

    await test.save();

    res.json({ 
      message: 'Test submitted successfully',
      score,
      correctCount,
      totalQuestions: answers.length
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-submit endpoint for when time runs out
router.post('/tests/:testId/auto-submit', async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body;
    const studentId = req.user._id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Process answers
    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
      const isCorrect = answer.userAnswer?.toString() === answer.correctAnswer?.toString();
      if (isCorrect) correctCount++;
      
      return {
        questionIndex: index,
        question: answer.question,
        userAnswer: answer.userAnswer || "",
        correctAnswer: answer.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / answers.length) * 100);

    // Create auto-submit result
    const submissionData = {
      studentId,
      answers: processedAnswers,
      correctCount,
      totalQuestions: answers.length,
      score,
      submittedAt: new Date(),
      status: 'submitted',
      isAutoSubmit: true // Flag for auto-submission
    };

    // Find existing result or add new one
    let existingResultIndex = test.results.findIndex(
      result => result.studentId.toString() === studentId.toString()
    );

    if (existingResultIndex >= 0) {
      test.results[existingResultIndex] = submissionData;
    } else {
      test.results.push(submissionData);
    }

    await test.save();

    res.json({ 
      message: 'Test auto-submitted successfully',
      score,
      correctCount,
      totalQuestions: answers.length
    });

  } catch (error) {
    console.error('Error auto-submitting test:', error);
    res.status(500).json({ error: error.message });
  }
});



// // Run every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();

  try {
    const tests = await Test.find({ status: "active" });

    for (let test of tests) {
      const endTime = new Date(test.startTime.getTime() + test.duration * 60 * 1000);

      if (now >= endTime) {
        test.status = "completed";
        await test.save();
        console.log(`✅ Test ${test._id} auto-completed`);
      }
    }
  } catch (err) {
    console.error("❌ Error auto-completing tests:", err);
  }
});



// Get active test
// router.get('/tests/active', async (req, res) => {
//   try {
//     const activeTest = await Test.findOne({ 
//       createdBy: req.admin._id,
//       status: 'active' 
//     }).populate('targetStudents', 'name email');

//     if (!activeTest) {
//       return res.json(null);
//     }

//     res.json(activeTest);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Submit test results (called by student app)


// =====================
// ANNOUNCEMENTS
// =====================

// Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({ 
      createdBy: req.admin._id 
    }).sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create announcement
router.post('/announcements', async (req, res) => {
  try {
    const { title, message, targetGroup, attachment } = req.body;

    const announcement = new Announcement({
      title,
      message,
      targetGroup,
      attachment,
      createdBy: req.admin._id
    });

    await announcement.save();

    res.status(201).json({ 
      message: 'Announcement created successfully', 
      announcementId: announcement._id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Give rewards to student - FIXED VERSION
router.post('/students/:id/rewards', async (req, res) => {
  try {
    const { type, amount, note } = req.body; // type: 'stars' | 'badges'
    
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Initialize rewards if they don't exist
    if (!student.rewards) {
      student.rewards = { stars: 0, badges: 0 };
    }
    
    // Update student's rewards
    student.rewards[type] = (student.rewards[type] || 0) + parseInt(amount);
    
    // Initialize reward history if it doesn't exist
    if (!student.rewardHistory) {
      student.rewardHistory = [];
    }
    
    student.rewardHistory.push({
      type,
      amount: parseInt(amount),
      note,
      givenBy: req.admin._id,
      date: new Date()
    });

    await student.save();

    res.json({ 
      message: `${amount} ${type} awarded successfully`,
      newTotal: student.rewards[type],
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        rewards: student.rewards
      }
    });
  } catch (error) {
    console.error('Reward error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student rewards - NEW ROUTE
router.get('/students/:id/rewards', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('firstName lastName rewards rewardHistory');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        rewards: student.rewards || { stars: 0, badges: 0 },
        rewardHistory: student.rewardHistory || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk reward giving - NEW ROUTE
router.post('/rewards/bulk', async (req, res) => {
  try {
    const { studentIds, type, amount, note } = req.body;
    
    const results = await Promise.all(
      studentIds.map(async (studentId) => {
        try {
          const student = await User.findById(studentId);
          if (!student) return { studentId, error: 'Student not found' };

          if (!student.rewards) {
            student.rewards = { stars: 0, badges: 0 };
          }
          
          student.rewards[type] = (student.rewards[type] || 0) + parseInt(amount);
          
          if (!student.rewardHistory) {
            student.rewardHistory = [];
          }
          
          student.rewardHistory.push({
            type,
            amount: parseInt(amount),
            note,
            givenBy: req.admin._id,
            date: new Date()
          });

          await student.save();
          
          return { 
            studentId, 
            success: true, 
            newTotal: student.rewards[type],
            studentName: `${student.firstName} ${student.lastName}`
          };
        } catch (error) {
          return { studentId, error: error.message };
        }
      })
    );

    res.json({ 
      message: 'Bulk rewards processed',
      results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// BACKEND - Enhanced Announcement Routes for admin.js
// Add these routes to your admin.js file:

// Get all announcements with better structure
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({ 
      createdBy: req.admin._id 
    }).sort({ createdAt: -1 }).populate('createdBy', 'firstName lastName');

    // Add read status for each announcement
    const announcementsWithStats = await Promise.all(
      announcements.map(async (announcement) => {
        const targetStudents = announcement.targetGroup === 'all' 
          ? await User.find({ role: 'student' }).count()
          : await User.find({ role: 'student', group: announcement.targetGroup }).count();
        
        return {
          ...announcement.toObject(),
          targetStudentCount: targetStudents,
          readCount: announcement.readBy ? announcement.readBy.length : 0
        };
      })
    );

    res.json(announcementsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create announcement with predefined templates
router.post('/announcements', async (req, res) => {
  try {
    const { title, message, targetGroup, priority, isTemplate, templateName } = req.body;

    const announcement = new Announcement({
      title,
      message,
      targetGroup: targetGroup || 'all',
      priority: priority || 'normal', // 'low', 'normal', 'high', 'urgent'
      isTemplate: isTemplate || false,
      templateName: templateName || null,
      createdBy: req.admin._id,
      readBy: [],
      createdAt: new Date()
    });

    await announcement.save();

    res.status(201).json({ 
      message: 'Announcement created successfully', 
      announcementId: announcement._id,
      announcement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get predefined announcement templates
router.get('/announcements/templates', async (req, res) => {
  try {
    const predefinedTemplates = [
      {
        id: 'test_reminder',
        title: 'Test Reminder',
        message: 'Dear students, this is a reminder that you have an upcoming test. Please prepare well and ensure you have a stable internet connection.',
        category: 'Test'
      },
      {
        id: 'homework_deadline',
        title: 'Homework Deadline Reminder', 
        message: 'Please remember to submit your homework by the deadline. Late submissions will not be accepted.',
        category: 'Homework'
      },
      {
        id: 'class_cancelled',
        title: 'Class Cancelled',
        message: 'Today\'s class has been cancelled due to unforeseen circumstances. We will resume as per regular schedule.',
        category: 'Schedule'
      },
      {
        id: 'congratulations',
        title: 'Congratulations!',
        message: 'Congratulations to all students who performed exceptionally well in the recent test. Keep up the good work!',
        category: 'Achievement'
      },
      {
        id: 'system_maintenance',
        title: 'System Maintenance',
        message: 'The system will be under maintenance from [TIME] to [TIME]. Please plan your activities accordingly.',
        category: 'Technical'
      }
    ];

    // Also get user-created templates
    const userTemplates = await Announcement.find({ 
      createdBy: req.admin._id,
      isTemplate: true 
    }).select('templateName title message category');

    res.json({
      predefined: predefinedTemplates,
      userCreated: userTemplates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark announcement as read (for students)
router.post('/announcements/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (!announcement.readBy) {
      announcement.readBy = [];
    }

    // Add user to readBy array if not already present
    if (!announcement.readBy.includes(userId)) {
      announcement.readBy.push(userId);
      await announcement.save();
    }

    res.json({ message: 'Announcement marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get announcement statistics
router.get('/announcements/:id/stats', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const targetStudents = announcement.targetGroup === 'all' 
      ? await User.find({ role: 'student' })
      : await User.find({ role: 'student', group: announcement.targetGroup });

    const readCount = announcement.readBy ? announcement.readBy.length : 0;
    const unreadCount = targetStudents.length - readCount;

    res.json({
      totalTargeted: targetStudents.length,
      readCount,
      unreadCount,
      readPercentage: targetStudents.length > 0 ? Math.round((readCount / targetStudents.length) * 100) : 0,
      readBy: announcement.readBy || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update announcement
// router.put('/announcements/:id', async (req, res) => {
//   try {
//     const { title, message, targetGroup } = req.body;
    
//     const announcement = await Announcement.findByIdAndUpdate(
//       req.params.id,
//       { title, message, targetGroup },
//       { new: true }
//     );

//     if (!announcement) {
//       return res.status(404).json({ error: 'Announcement not found' });
//     }

//     res.json(announcement);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete announcement
// router.delete('/announcements/:id', async (req, res) => {
//   try {
//     const announcement = await Announcement.findByIdAndDelete(req.params.id);
//     if (!announcement) {
//       return res.status(404).json({ error: 'Announcement not found' });
//     }

//     res.json({ message: 'Announcement deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // =====================
// // REWARDS & FEEDBACK
// // =====================

// // Give rewards to student
// router.post('/students/:id/rewards', async (req, res) => {
//   try {
//     const { type, amount, note } = req.body; // type: 'stars' | 'badges'
    
//     const student = await User.findById(req.params.id);
//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     // Update student's rewards
//     if (!student.rewards) {
//       student.rewards = { stars: 0, badges: 0 };
//     }
    
//     student.rewards[type] += amount;
//     student.rewardHistory = student.rewardHistory || [];
//     student.rewardHistory.push({
//       type,
//       amount,
//       note,
//       givenBy: req.admin._id,
//       date: new Date()
//     });

//     await student.save();

//     res.json({ message: `${amount} ${type} awarded successfully` });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // =====================
// // ANALYTICS & REPORTS
// // =====================

// // Get dashboard overview stats
// router.get('/analytics/overview', async (req, res) => {
//   try {
//     const totalStudents = await User.countDocuments({ role: 'student' });
//     const totalGroups = await Group.countDocuments({ createdBy: req.admin._id });
    
//     const performances = await Performance.find({});
//     const totalGames = performances.reduce((sum, p) => sum + (p.totalGames || 0), 0);
//     const avgAccuracy = performances.length > 0 
//       ? performances.reduce((sum, p) => sum + ((p.totalCorrect || 0) / (p.totalGames || 1) * 100), 0) / performances.length
//       : 0;

//     // Get recent activity (last 7 days)
//     const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//     const recentGames = await Performance.aggregate([
//       { $unwind: '$history' },
//       { $match: { 'history.date': { $gte: weekAgo } } },
//       { 
//         $group: { 
//           _id: { $dateToString: { format: '%Y-%m-%d', date: '$history.date' } },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     res.json({
//       totalStudents,
//       totalGroups,
//       totalGames,
//       avgAccuracy: Math.round(avgAccuracy * 100) / 100,
//       recentActivity: recentGames
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Export data to CSV

// // Export data to CSV
// router.get('/export/performance', async (req, res) => {
//   try {
//     const students = await User.find({ role: 'student' }).select('name email group');
//     const performances = await Performance.find({});
    
//     // Create CSV data
//     const csvData = students.map(student => {
//       const perf = performances.find(p => p.userId.toString() === student._id.toString());
//       return {
//         Name: student.name,
//         Email: student.email,
//         Group: student.group,
//         TotalGames: perf?.totalGames || 0,
//         TotalCorrect: perf?.totalCorrect || 0,
//         TotalScore: perf?.totalScore || 0,
//         Accuracy: perf ? ((perf.totalCorrect / perf.totalGames) * 100).toFixed(2) : '0.00'
//       };
//     });

//     // Convert to CSV format
//     const csvHeaders = Object.keys(csvData[0]).join(',');
//     const csvRows = csvData.map(row => Object.values(row).join(','));
//     const csvContent = [csvHeaders, ...csvRows].join('\n');

//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', 'attachment; filename=student_performance.csv');
//     res.send(csvContent);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get specific student performance details
// router.get('/students/:userId', verifyAdmin, async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     // Use your existing performance fetching logic
//     const performance = await getPerformanceData(userId); // Your existing function
    
//     if (!performance) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     res.json({
//       userId,
//       performance,
//       recentGames: performance.history || []
//     });
//   } catch (error) {
//     console.error('Error fetching student details:', error);
//     res.status(500).json({ error: 'Failed to fetch student details' });
//   }
// });

// // Create a new student (extends your existing system)
// router.post('/students', verifyAdmin, async (req, res) => {
//   try {
//     const { name, email, password, group } = req.body;
    
//     // Generate a unique user ID
//     const userId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     // Initialize performance record using your existing structure
//     const performanceData = {
//       userId: userId,
//       userName: name,
//       userEmail: email,
//       totalGames: 0,
//       totalCorrect: 0,
//       totalScore: 0,
//       gameTypes: {},
//       dailyStats: {},
//       history: [],
//       createdAt: new Date(),
//       createdBy: req.admin.userId
//     };

//     // Save using your existing performance saving logic
//     await savePerformanceData(userId, performanceData);
    
//     res.status(201).json({ 
//       message: 'Student created successfully', 
//       studentId: userId 
//     });
//   } catch (error) {
//     console.error('Error creating student:', error);
//     res.status(500).json({ error: 'Failed to create student' });
//   }
// });

// // Give rewards to student (extends your existing performance system)
// router.post('/rewards', verifyAdmin, async (req, res) => {
//   try {
//     const { studentId, rewardType, amount, note } = req.body;
    
//     // Get existing performance data
//     const performance = await getPerformanceData(studentId);
//     if (!performance) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     // Add rewards to performance data
//     if (!performance.rewards) {
//       performance.rewards = { stars: 0, badges: 0 };
//     }
    
//     performance.rewards[rewardType] = (performance.rewards[rewardType] || 0) + amount;
    
//     // Add to reward history
//     if (!performance.rewardHistory) {
//       performance.rewardHistory = [];
//     }
    
//     performance.rewardHistory.push({
//       type: rewardType,
//       amount,
//       note,
//       givenBy: req.admin.userId,
//       date: new Date()
//     });

//     // Update total score for positive reinforcement
//     performance.totalScore += amount;

//     // Save updated performance data
//     await savePerformanceData(studentId, performance);

//     res.json({ message: `${amount} ${rewardType} awarded successfully` });
//   } catch (error) {
//     console.error('Error giving rewards:', error);
//     res.status(500).json({ error: 'Failed to give rewards' });
//   }
// });

// // Simple announcements system (you can extend this with a database)
// let announcements = []; // In production, store in database

// router.get('/announcements', verifyAdmin, async (req, res) => {
//   try {
//     res.json(announcements);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch announcements' });
//   }
// });

// router.post('/announcements', verifyAdmin, async (req, res) => {
//   try {
//     const { title, message, targetGroup } = req.body;
    
//     const announcement = {
//       id: `ann_${Date.now()}`,
//       title,
//       message,
//       targetGroup: targetGroup || 'all',
//       createdBy: req.admin.userId,
//       createdAt: new Date()
//     };

//     announcements.unshift(announcement);
    
//     res.status(201).json({ 
//       message: 'Announcement created successfully', 
//       announcementId: announcement.id 
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create announcement' });
//   }
// });

// // Test management system (basic implementation)
// let activeTest = null;
// let testResults = [];

// router.post('/tests/launch', verifyAdmin, async (req, res) => {
//   try {
//     const { gameType, difficulty, speed, count, duration } = req.body;
    
//     // Generate test questions based on your existing game logic
//     const questions = generateTestQuestions(gameType, difficulty, count);
    
//     const test = {
//       id: `test_${Date.now()}`,
//       createdBy: req.admin.userId,
//       gameType,
//       difficulty,
//       speed,
//       count,
//       duration,
//       questions,
//       startTime: new Date(),
//       status: 'active',
//       participants: [], // Students who started the test
//       results: []
//     };

//     activeTest = test;
//     testResults = [];

//     res.status(201).json({ 
//       message: 'Test launched successfully', 
//       testId: test.id,
//       test 
//     });
//   } catch (error) {
//     console.error('Error launching test:', error);
//     res.status(500).json({ error: 'Failed to launch test' });
//   }
// });

// // router.get('/tests/active', verifyAdmin, async (req, res) => {
// //   try {
// //     res.json(activeTest);
// //   } catch (error) {
// //     res.status(500).json({ error: 'Failed to get active test' });
// //   }
// // });

// // router.post('/tests/:testId/submit', async (req, res) => {
// //   try {
// //     const { studentId, answers, correctCount, totalQuestions, score } = req.body;
    
// //     const result = {
// //       studentId,
// //       answers,
// //       correctCount,
// //       totalQuestions,
// //       score,
// //       submittedAt: new Date(),
// //       status: 'submitted'
// //     };

// //     testResults.push(result);

// //     // Update student's performance data with test result
// //     const performance = await getPerformanceData(studentId);
// //     if (performance) {
// //       performance.totalGames += 1;
// //       performance.totalCorrect += correctCount;
// //       performance.totalScore += score;
      
// //       // Add to history
// //       if (!performance.history) performance.history = [];
// //       performance.history.push({
// //         date: new Date(),
// //         gameType: 'Test',
// //         score,
// //         correct: correctCount,
// //         total: totalQuestions,
// //         timestamp: new Date()
// //       });

// //       await savePerformanceData(studentId, performance);
// //     }

// //     res.json({ message: 'Test submitted successfully' });
// //   } catch (error) {
// //     console.error('Error submitting test:', error);
// //     res.status(500).json({ error: 'Failed to submit test' });
// //   }
// // });

// // Helper functions (adapt these to your existing data layer)
// async function getAllPerformanceRecords() {
//   // Implement this using your existing data fetching logic
//   // This should return all performance records from your system
  
//   // Example implementation:
//   try {
//     // If using localStorage simulation on server:
//     // return Object.values(performanceStore);
    
//     // If using database:
//     // return await Performance.find({});
    
//     // For now, return empty array - you'll implement based on your data layer
//     return [];
//   } catch (error) {
//     console.error('Error fetching performance records:', error);
//     return [];
//   }
// }

// async function getPerformanceData(userId) {


//   // Use your existing performance data fetching logic
//   // This should match the format you already use
  
//   // Example:
//   // return await Performance.findOne({ userId });
//   // or however you currently fetch performance data
  
//   return null; // Implement based on your existing system
// }

// async function savePerformanceData(userId, data) {
//   // Use your existing performance data saving logic
  
//   // Example:
//   // await Performance.findOneAndUpdate({ userId }, data, { upsert: true });
//   // or however you currently save performance data
  
//   console.log('Saving performance data for:', userId, data);
// }

// Generate test questions based on your existing game types
function generateTestQuestions(gameType, difficulty, count) {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    let question, answer;
    
    // Use your existing number generation logic
    const getRandomNumber = (digits) => {
      if (digits === 1) return Math.floor(Math.random() * 9) + 1;
      if (digits === 2) return Math.floor(Math.random() * 90) + 10;
      return Math.floor(Math.random() * 900) + 100;
    };
    
    switch (gameType) {
      case 'multiplication':
        const a = getRandomNumber(difficulty === 'single' ? 1 : 2);
        const b = getRandomNumber(difficulty === 'single' ? 1 : 2);
        question = `${a} × ${b} = ?`;
        answer = (a * b).toString();
        break;
        
      case 'addition':
        const c = getRandomNumber(difficulty === 'single' ? 1 : 2);
        const d = getRandomNumber(difficulty === 'single' ? 1 : 2);
        question = `${c} + ${d} = ?`;
        answer = (c + d).toString();
        break;
        
      case 'subtraction':
        const e = getRandomNumber(difficulty === 'single' ? 1 : 2);
        const f = getRandomNumber(difficulty === 'single' ? 1 : 2);
        const larger = Math.max(e, f);
        const smaller = Math.min(e, f);
        question = `${larger} - ${smaller} = ?`;
        answer = (larger - smaller).toString();
        break;
        
      case 'division':
        const divisor = getRandomNumber(difficulty === 'single' ? 1 : 2);
        const quotient = getRandomNumber(difficulty === 'single' ? 1 : 2);
        const dividend = divisor * quotient;
        question = `${dividend} ÷ ${divisor} = ?`;
        answer = quotient.toString();
        break;
        
      default:
        question = `${i + 1} + ${i + 1} = ?`;
        answer = ((i + 1) * 2).toString();
    }
    
    questions.push({
      question,
      correctAnswer: answer,
      type: gameType
    });
  }
  
  return questions;
}




router.patch('/students/:id/toggle-status', verifyAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        error: 'isActive must be a boolean value' 
      });
    }

    const student = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      message: `Student ${isActive ? 'enabled' : 'disabled'} successfully`,
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        isActive: student.isActive
      }
    });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student status
router.get('/students/:id/status', verifyAdmin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('_id firstName lastName email isActive');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      studentId: student._id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      isActive: student.isActive
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student
router.delete('/students/:id', verifyAdmin, async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Also delete associated performance data and test results
    await Performance.findOneAndDelete({ userId: student._id });
    await Test.deleteMany({ 'results.studentId': student._id });
    
    // Remove from groups
    await Group.updateMany(
      { students: student._id },
      { $pull: { students: student._id } }
    );

    res.json({ 
      message: 'Student and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk toggle student status
router.patch('/students/bulk/toggle-status', verifyAdmin, async (req, res) => {
  try {
    const { studentIds, isActive } = req.body;

    if (!Array.isArray(studentIds) || typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        error: 'studentIds must be array and isActive must be boolean' 
      });
    }

    const result = await User.updateMany(
      { _id: { $in: studentIds } },
      { isActive }
    );

    res.json({
      message: `${result.modifiedCount} students ${isActive ? 'enabled' : 'disabled'} successfully`,
      modified: result.modifiedCount,
      matched: result.matchedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// GROUPS MANAGEMENT - ENHANCED
// =====================

// Get all groups with statistics
router.get('/groups', verifyAdmin, async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.admin._id })
      .populate('students', 'firstName lastName email');

    // Calculate statistics for each group
    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
        const performances = await Performance.find({
          userId: { $in: group.students.map(s => s._id) }
        });

        const avgScore = performances.length > 0
          ? performances.reduce((sum, p) => sum + (p.totalScore || 0), 0) / performances.length
          : 0;

        const avgAccuracy = performances.length > 0
          ? performances.reduce((sum, p) => {
              const acc = p.totalGames > 0 ? (p.totalCorrect / p.totalGames) * 100 : 0;
              return sum + acc;
            }, 0) / performances.length
          : 0;

        return {
          _id: group._id,
          name: group.name,
          description: group.description,
          studentCount: group.students.length,
          students: group.students,
          avgScore: Math.round(avgScore * 100) / 100,
          avgAccuracy: Math.round(avgAccuracy * 100) / 100,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt
        };
      })
    );

    res.json(groupsWithStats);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new group
router.post('/groups', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Check if group name already exists
    const existingGroup = await Group.findOne({ 
      name,
      createdBy: req.admin._id 
    });

    if (existingGroup) {
      return res.status(400).json({ 
        error: 'A group with this name already exists' 
      });
    }

    const group = new Group({
      name,
      description: description || '',
      createdBy: req.admin._id,
      students: []
    });

    await group.save();

    res.status(201).json({
      message: 'Group created successfully',
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        studentCount: 0,
        createdAt: group.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update group
router.put('/groups/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Check if name is already taken by another group
    if (name) {
      const existingGroup = await Group.findOne({
        name,
        _id: { $ne: req.params.id },
        createdBy: req.admin._id
      });

      if (existingGroup) {
        return res.status(400).json({ 
          error: 'A group with this name already exists' 
        });
      }
    }

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    ).populate('students', 'firstName lastName email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group updated successfully',
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        studentCount: group.students.length,
        students: group.students
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete group
router.delete('/groups/:id', verifyAdmin, async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove group reference from students
    await User.updateMany(
      { group: group.name },
      { $unset: { group: 1 } }
    );

    res.json({ 
      message: 'Group deleted successfully. Students have been unassigned from this group.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add student to group
router.post('/groups/:groupId/students/:studentId', verifyAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const student = await User.findById(req.params.studentId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Add student to group if not already present
    if (!group.students.includes(student._id)) {
      group.students.push(student._id);
      await group.save();

      // Update student's group field
      student.group = group.name;
      await student.save();
    }

    res.json({
      message: 'Student added to group successfully',
      group: {
        _id: group._id,
        name: group.name,
        studentCount: group.students.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove student from group
router.delete('/groups/:groupId/students/:studentId', verifyAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const student = await User.findById(req.params.studentId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Remove student from group
    group.students = group.students.filter(
      id => id.toString() !== student._id.toString()
    );
    await group.save();

    // Update student's group field
    if (student.group === group.name) {
      student.group = null;
      await student.save();
    }

    res.json({
      message: 'Student removed from group successfully',
      group: {
        _id: group._id,
        name: group.name,
        studentCount: group.students.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group details with students
router.get('/groups/:id', verifyAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate({
        path: 'students',
        select: 'firstName lastName email studentId isActive rewards'
      });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get performance data for group
    const performances = await Performance.find({
      userId: { $in: group.students.map(s => s._id) }
    });

    const avgScore = performances.length > 0
      ? performances.reduce((sum, p) => sum + (p.totalScore || 0), 0) / performances.length
      : 0;

    res.json({
      _id: group._id,
      name: group.name,
      description: group.description,
      studentCount: group.students.length,
      students: group.students,
      avgScore: Math.round(avgScore * 100) / 100,
      avgPerformance: {
        totalStudents: group.students.length,
        averageScore: Math.round(avgScore * 100) / 100,
        totalPerformanceRecords: performances.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students available to add to a group (not already in this group)
router.get('/groups/:id/available-students', verifyAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get all students that aren't already in this group
    const availableStudents = await User.find({
      role: 'student',
      _id: { $nin: group.students }
    }).select('firstName lastName email studentId isActive');

    res.json({
      groupId: group._id,
      groupName: group.name,
      availableStudents: availableStudents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk add students to group
router.post('/groups/:id/add-students', verifyAdmin, async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'studentIds must be a non-empty array' });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Add students to group
    const newStudents = studentIds.filter(
      id => !group.students.includes(id)
    );

    group.students.push(...newStudents);
    await group.save();

    // Update student group field
    await User.updateMany(
      { _id: { $in: newStudents } },
      { group: group.name }
    );

    res.json({
      message: `${newStudents.length} students added to group successfully`,
      addedCount: newStudents.length,
      groupStudentCount: group.students.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group statistics/analytics
router.get('/groups/:id/statistics', verifyAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('students', 'firstName lastName isActive');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get performance data
    const performances = await Performance.find({
      userId: { $in: group.students.map(s => s._id) }
    });

    // Calculate detailed statistics
    const stats = {
      totalStudents: group.students.length,
      activeStudents: group.students.filter(s => s.isActive).length,
      disabledStudents: group.students.filter(s => !s.isActive).length,
      totalGamesPlayed: performances.reduce((sum, p) => sum + (p.totalGames || 0), 0),
      totalCorrectAnswers: performances.reduce((sum, p) => sum + (p.totalCorrect || 0), 0),
      averageScore: performances.length > 0
        ? Math.round(performances.reduce((sum, p) => sum + (p.totalScore || 0), 0) / performances.length)
        : 0,
      averageAccuracy: performances.length > 0
        ? Math.round(
            performances.reduce((sum, p) => {
              const acc = p.totalGames > 0 ? (p.totalCorrect / p.totalGames) * 100 : 0;
              return sum + acc;
            }, 0) / performances.length
          )
        : 0,
      performanceRecords: performances.length
    };

    res.json({
      groupId: group._id,
      groupName: group.name,
      description: group.description,
      statistics: stats,
      students: group.students.map(s => ({
        _id: s._id,
        name: `${s.firstName} ${s.lastName}`,
        isActive: s.isActive
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export group data to CSV
router.get('/groups/:id/export', verifyAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('students', 'firstName lastName email studentId');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const performances = await Performance.find({
      userId: { $in: group.students.map(s => s._id) }
    });

    // Create CSV data
    const csvData = group.students.map(student => {
      const perf = performances.find(p => p.userId.toString() === student._id.toString());
      return {
        'First Name': student.firstName,
        'Last Name': student.lastName,
        'Email': student.email,
        'Student ID': student.studentId,
        'Total Games': perf?.totalGames || 0,
        'Total Correct': perf?.totalCorrect || 0,
        'Total Score': perf?.totalScore || 0,
        'Accuracy': perf && perf.totalGames > 0 
          ? ((perf.totalCorrect / perf.totalGames) * 100).toFixed(2) 
          : '0.00'
      };
    });

    // Convert to CSV format
    const headers = Object.keys(csvData[0] || {});
    const csvHeaders = headers.join(',');
    const csvRows = csvData.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=group_${group.name}_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify admin middleware (make sure it's defined if not already)




// =====================
// GROUPS MANAGEMENT
// =====================

// Get all groups
router.get('/groups', verifyAdmin, async (req, res) => {
  try {
    let groups = await Group.find({ createdBy: req.admin._id });
    
    if (!groups || groups.length === 0) {
      return res.json([]);
    }

    // Calculate statistics for each group
    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
        try {
          const groupStudents = group.students || [];
          
          // Get performances for students in this group
          const performances = await Performance.find({
            userId: { $in: groupStudents }
          });

          const avgScore = performances.length > 0
            ? Math.round(performances.reduce((sum, p) => sum + (p.totalScore || 0), 0) / performances.length)
            : 0;

          const avgAccuracy = performances.length > 0
            ? Math.round(
                performances.reduce((sum, p) => {
                  const acc = p.totalGames > 0 ? (p.totalCorrect / p.totalGames) * 100 : 0;
                  return sum + acc;
                }, 0) / performances.length
              )
            : 0;

          return {
            _id: group._id,
            name: group.name,
            description: group.description || '',
            studentCount: groupStudents.length || 0,
            avgScore: avgScore || 0,
            avgAccuracy: avgAccuracy || 0,
            createdAt: group.createdAt
          };
        } catch (error) {
          console.error('Error processing group:', group._id, error);
          return {
            _id: group._id,
            name: group.name,
            description: group.description || '',
            studentCount: (group.students || []).length,
            avgScore: 0,
            avgAccuracy: 0,
            createdAt: group.createdAt
          };
        }
      })
    );

    res.json(groupsWithStats);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single group details
router.get('/groups/:id', verifyAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const groupStudents = group.students || [];
    
    // Get performances
    const performances = await Performance.find({
      userId: { $in: groupStudents }
    });

    const avgScore = performances.length > 0
      ? Math.round(performances.reduce((sum, p) => sum + (p.totalScore || 0), 0) / performances.length)
      : 0;

    res.json({
      _id: group._id,
      name: group.name,
      description: group.description,
      studentCount: groupStudents.length,
      avgScore: avgScore,
      createdAt: group.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create group
router.post('/groups', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Check if group name exists
    const existing = await Group.findOne({ 
      name: name.trim(),
      createdBy: req.admin._id 
    });

    if (existing) {
      return res.status(400).json({ error: 'Group with this name already exists' });
    }

    const group = new Group({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: req.admin._id,
      students: []
    });

    await group.save();

    res.status(201).json({
      message: 'Group created successfully',
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        studentCount: 0,
        createdAt: group.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update group
router.put('/groups/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Check if another group has this name
    const existing = await Group.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
      createdBy: req.admin._id
    });

    if (existing) {
      return res.status(400).json({ error: 'Group with this name already exists' });
    }

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { 
        name: name.trim(),
        description: description?.trim() || ''
      },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group updated successfully',
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        studentCount: (group.students || []).length,
        createdAt: group.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: error.message });
  }
});



// Delete group

module.exports = router;



