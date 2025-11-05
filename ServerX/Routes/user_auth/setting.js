const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // Assuming your User model is defined in this file
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'anykey';
const { authenticateUser } = require("../../middleware/authentication");

router.put('/user/update-password', authenticateUser, async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
  
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      if (currentPassword !== user.password) {
        return res.status(401).json({ message: 'Invalid password' });
    }
      // const isMatch = await bcrypt.compare(currentPassword, user.password);
      // if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });
  

      // const hashedPassword = await bcrypt.hash(, 10);
      user.password = newPassword;
  
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

module.exports = router;