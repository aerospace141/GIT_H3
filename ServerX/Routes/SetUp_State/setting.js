const express = require('express');
const router = express.Router();
// const { verifyUser, deleteUser } = require('../controllers/userController');
const { authenticateUser } = require('../../middleware/authentication');
const User = require('../../models/user'); 

// const bcrypt = require('bcryptjs');

// const verifyUser = async (req, res) => {
//   try {
//     const { password } = req.body;
//     const user = await User.findById(req.user.id); // Get user from token

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password); // Verify password
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid password' });
//     }

//     res.status(200).json({ message: 'Verification successful' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const deleteUser = async (req, res) => {
//     try {
//       const user = await User.findByIdAndDelete(req.user.id); // Delete user by ID
  
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       res.status(200).json({ message: 'Account deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   };

router.put('/user/update-password', authenticateUser, async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
  
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      if (currentPassword !== user.password) {
        return res.status(401).json({ success: false, error: 'Incorrect password' });
      }
  
    //   const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = newPassword;
  
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

router.post('/users/delete/verify', authenticateUser, async (req, res) => {
    try {
      const { password } = req.body;
      const user = await User.findOne({ userId: req.userId }); // Get user from token
  
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
  
      if (password !== user.password) {
        return res.status(401).json({ success: false, error: 'Incorrect password' });
      }
  
      res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }); // Verify user
router.delete('/users/delete', authenticateUser, async (req, res) => {
    try {
      const user = await User.findOneAndDelete({ userId: req.userId }); // Delete user by ID
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }); // Delete user

module.exports = router;
