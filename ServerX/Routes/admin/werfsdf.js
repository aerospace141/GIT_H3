const express = require('express');
const studentRouter = express.Router();
const { authenticateUser } = require("../../middleware/authentication");

const User = require('../../models/user');
const Performance = require('../../models/Performance');
const Test = require('../../models/Test');
const Announcement = require('../../models/Announcement');
const Group = require('../../models/Group');

// Get announcements for student
studentRouter.get('/announcements', async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    
    const announcements = await Announcement.find({
      $or: [
        { targetGroup: 'all' },
        { targetGroup: student.group }
      ]
    }).sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark announcement as read
studentRouter.post('/announcements/:id/read', async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          readBy: {
            studentId: req.user.id,
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

// Get active tests for student
studentRouter.get('/tests/active', authenticateUser, async (req, res) => {
  try {
    const activeTests = await Test.find({
      targetStudents: req._id,
      status: 'active',
      startTime: { $lte: new Date() }
    });

    res.json(activeTests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test questions (only when test is active)
studentRouter.get('/tests/:testId', authenticateUser, async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    
    if (!test || test.status !== 'active') {
      return res.status(404).json({ error: 'Test not found or inactive' });
    }

    if (!test.targetStudents.includes(req._id)) {
      return res.status(403).json({ error: 'Not authorized for this test' });
    }

    // Check if student already submitted
    const existingSubmission = test.results.find(
      r => r.studentId.toString() === req._id.toString()
    );

    if (existingSubmission && existingSubmission.status === 'submitted') {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    res.json({
      testId: test._id,
      duration: test.duration,
      questions: test.questions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.options
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  module.exports = studentRouter;
