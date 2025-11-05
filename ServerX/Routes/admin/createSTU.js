// routes/admin.js - This connects with your existing system

const express = require('express');
// const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../../models/user'); // Use your existing User model (lowercase 'user')

// Middleware to check if user is teacher (you may need to adjust this based on your auth system)
const checkTeacherRole = async (req, res, next) => {
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
    req.admin = user;
req.userId = decoded.userId;
req.user = user;   // ✅ add this line

    next();
  } catch (error) {
    res.status(409).json({ error: 'Invalid token' });
  }
};

// Create new student account (admin creates for students)
router.post('/students', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      studentId, 
      class: studentClass, 
      section, 
      password,
      mobileNumber,
      mobile 
    } = req.body;

    // Validation
    if (!name || !email || !studentId || !studentClass || !password) {
      return res.status(400).json({ 
        message: 'Name, email, student ID, class, and password are required' 
      });
    }

    // Split name into firstName and lastName to match your existing schema
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName; // Use firstName as lastName if only one name provided

    // Check if student ID already exists
    // const existingStudentById = await User.findOne({ userId: studentId });
    // if (existingStudentById) {
    //   return res.status(400).json({ 
    //     message: 'Student ID already exists. Please use a different ID.' 
    //   });
    // }

    // Check if email already exists
    const existingStudentByEmail = await User.findOne({ email });
    if (existingStudentByEmail) {
      return res.status(400).json({ 
        message: 'Email already exists. Please use a different email.' 
      });
    }

    // Check if mobile number exists (if provided)
    if (mobileNumber) {
      const existingStudentByMobile = await User.findOne({ mobileNumber });
      if (existingStudentByMobile) {
        return res.status(400).json({ 
          message: 'Mobile number already exists. Please use a different number.' 
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Hash password using the same method as your existing signup
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student using your existing User schema
    const newStudent = new User({
      userId: studentId, // Using studentId as userId to match your schema
      firstName,
      lastName,
      email,
      mobileNumber: mobile || '123456789052', // Make optional
      password: password,
      role: 'student', // Set role as student
      group: studentClass, // Use group field for class
      // Add custom fields that aren't in your original schema
      class: studentClass,
      section: section || null,
    //   createdBy: req.userId, // Track which teacher created this student
      rewards: {
        stars: 0,
        badges: 0
      },
      rewardHistory: []
    });

    await newStudent.save();

    // Return student data without password
    const studentResponse = {
      id: newStudent._id,
      userId: newStudent.userId,
      name: `${newStudent.firstName} ${newStudent.lastName}`,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      email: newStudent.email,
      studentId: newStudent.userId,
      class: studentClass,
      section: section,
      mobileNumber: newStudent.mobileNumber,
      role: newStudent.role,
      createdAt: newStudent._id.getTimestamp() // MongoDB ObjectId timestamp
    };

    res.status(201).json({
      message: 'Student account created successfully',
      student: studentResponse
    });

  } catch (error) {
    console.error('Error creating student:', error);
    
    // Handle duplicate key errors (from your existing error handling)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `This ${field} is already registered. Please use a different ${field}.` 
      });
    }
    
    res.status(502).json({ 
      message: 'Server error creating student account. Please try again.' 
    });
  }
});

// Get all students (for admin dashboard)
router.get('/students', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, class: filterClass, section: filterSection } = req.query;

    // Build query for students only
    let query = { role: 'student' };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    if (filterClass) {
      query.group = filterClass; // Using group field as class
    }

    // Execute query with pagination
    const students = await User.find(query)
      .select('-password') // Exclude password from results
      .sort({ _id: -1 }) // Sort by creation date (newest first)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Format response to match what your frontend expects
    const formattedStudents = students.map(student => ({
      userId: student._id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      studentId: student.userId,
      class: student.group || student.class,
      section: student.section,
      role: student.role,
      mobileNumber: student.mobileNumber,
      rewards: student.rewards,
      createdAt: student._id.getTimestamp()
    }));

    res.json(formattedStudents); // Return array directly to match your existing loadStudents function

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      message: 'Server error fetching students' 
    });
  }
});

// Get single student details
router.get('/students/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentData = {
      userId: student._id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      studentId: student.userId,
      class: student.group || student.class,
      section: student.section,
      role: student.role,
      mobileNumber: student.mobileNumber,
      rewards: student.rewards,
      rewardHistory: student.rewardHistory,
      createdAt: student._id.getTimestamp()
    };

    res.json({ student: studentData });

  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ 
      message: 'Server error fetching student details' 
    });
  }
});

// Give rewards to student
router.post('/rewards', async (req, res) => {
  try {
    const { studentId, rewardType, amount, note } = req.body;

    if (!studentId || !rewardType || !amount) {
      return res.status(400).json({ 
        message: 'Student ID, reward type, and amount are required' 
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update rewards
    if (rewardType === 'stars') {
      student.rewards.stars += parseInt(amount);
    } else if (rewardType === 'badges') {
      student.rewards.badges += parseInt(amount);
    }

    // Add to reward history
    student.rewardHistory.push({
      type: rewardType,
      amount: parseInt(amount),
      note: note || `Awarded ${amount} ${rewardType}`,
      givenBy: req.user.userId,
      date: new Date()
    });

    await student.save();

    res.json({ 
      message: `Successfully gave ${amount} ${rewardType} to ${student.firstName}`,
      rewards: student.rewards 
    });

  } catch (error) {
    console.error('Error giving rewards:', error);
    res.status(500).json({ 
      message: 'Server error giving rewards' 
    });
  }
});

// Get statistics for dashboard
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    const studentsThisMonth = await User.countDocuments({
      role: 'student',
      _id: { 
        $gte: new Date(new Date().setDate(1)) // First day of current month
      }
    });

    // Get class distribution (using group field)
    const classDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$group', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get recent registrations
    const recentStudents = await User.find({ role: 'student' })
      .select('-password')
      .sort({ _id: -1 })
      .limit(5);

    const formattedRecentStudents = recentStudents.map(student => ({
      userId: student._id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      studentId: student.userId,
      class: student.group,
      section: student.section,
      createdAt: student._id.getTimestamp()
    }));

    res.json({
      totalStudents,
      studentsThisMonth,
      classDistribution,
      recentStudents: formattedRecentStudents
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      message: 'Server error fetching statistics' 
    });
  }
});

module.exports = router;