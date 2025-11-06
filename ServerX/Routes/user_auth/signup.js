const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // Assuming your User model is defined in this file
// const bcrypt = require('bcryptjs');
// const { authenticateUser } = require('../middleware/authentication');
const axios = require('axios');

router.post('/signup', async (req, res) => {
  try {
      const { firstName, lastName, email, mobileNumber, password, username, userId ,token} = req.body;
      const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET;
      
// Update in the verification
      const hcaptchaResponse = await axios.post(
        "https://hcaptcha.com/siteverify",
        null,
        {
          params: {
            secret: HCAPTCHA_SECRET,  // Changed from hcaptchaSecret
            response: token,
          },
        }
      );
  
    //   if (!hcaptchaResponse.data.success) {
    //     return res.status(400).json({ massage: "hCAPTCHA verification failed" });
    //   }
  

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Save password in plain text (⚠ Security Risk)
      const newUser = new User({ firstName, lastName, email, mobileNumber, password, userId, username });

      await newUser.save();

      res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
      console.error('Error creating #SIGNUPuser:', error);
      res.status(500).json({ error: error.message });

  }
});
  
module.exports = router;