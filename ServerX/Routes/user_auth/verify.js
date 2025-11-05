const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // Assuming your User model is defined in this file
const { authenticateUser } = require("../../middleware/authentication");


router.get('/auth/verify', authenticateUser , async (req, res) => {
    try {
      // const userId = req.userId;

      const user = await User.findOne({ userId: req.userId }).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        userId: user.userId,
        name: user.firstName,
        email: user.email,
        role: user.role
      });
    } catch (err) {
      console.error('Verification error:', err);
      res.status(500).json({ message: err.message });
    }
  });


module.exports = router;