const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

function initializeTestSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      socket.userId = user._id;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join teacher to admin room
    if (socket.userRole === 'teacher') {
      socket.join('admin-room');
      console.log('Teacher joined admin room');
    }

    // Handle test events from students
    socket.on('test-started', (data) => {
      console.log(`Student ${socket.userId} started test ${data.testId}`);
      socket.to('admin-room').emit('student-test-status', {
        studentId: socket.userId,
        testId: data.testId,
        status: 'started',
        timestamp: new Date()
      });
    });

    socket.on('test-progress', (data) => {
      socket.to('admin-room').emit('student-test-progress', {
        studentId: socket.userId,
        testId: data.testId,
        progress: data.progress,
        currentQuestion: data.currentQuestion,
        timestamp: new Date()
      });
    });

    socket.on('test-submitted', (data) => {
      console.log(`Student ${socket.userId} submitted test ${data.testId}`);
      socket.to('admin-room').emit('student-test-submitted', {
        studentId: socket.userId,
        testId: data.testId,
        score: data.score,
        correctCount: data.correctCount,
        totalQuestions: data.totalQuestions,
        timestamp: new Date()
      });
    });

    // Handle admin events
    socket.on('join-test-monitor', (testId) => {
      if (socket.userRole === 'teacher') {
        socket.join(`test-monitor-${testId}`);
        console.log(`Teacher joined test monitor for ${testId}`);
      }
    });

    socket.on('end-test', (testId) => {
      if (socket.userRole === 'teacher') {
        io.emit('test-ended', { testId, timestamp: new Date() });
        console.log(`Test ${testId} ended by admin`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Notify admin if student disconnects during test
      if (socket.userRole === 'student') {
        socket.to('admin-room').emit('student-disconnected', {
          studentId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  });

  return io;
}

module.exports = initializeTestSocket;
