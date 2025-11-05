const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'anykey';
const { authenticateUser } = require("../../middleware/authentication");
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client("679832363574-9don8skic3d6n3r8geli6ippcbrip1pe.apps.googleusercontent.com");

const generateDeviceId = () => {
  return crypto.randomBytes(32).toString('hex');
};


// Regular login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, deviceFingerprint } = req.body;

      const user = await User.findOne({
  $or: [
    { email: email  },
    { username: email}
  ]
});
    if (!user) {
      return res.status(404).json({ success: false, error: 'Email not registered' });
    }
    // Direct password comparison (consider using bcrypt for production)
    if (password !== user.password) {
      return res.status(401).json({ success: false, error: 'Incorrect password' });
    }
     
    if (!deviceFingerprint) {
      return res.status(400).json({ success: false, error: 'Device fingerprint is required' });
    }

    // Generate new device ID for this session
    const newDeviceId = generateDeviceId();
    
    // Update user with new device ID
    await User.findByIdAndUpdate(user._id, {
      currentDeviceId: newDeviceId,
      lastLoginTime: new Date(),
      deviceFingerprint: deviceFingerprint
    });

    // Create JWT token with consistent payload
    const token = jwt.sign(
      { 
        userId: user.userId, 
        deviceId: newDeviceId,  
        mobileNumber: user.mobileNumber,
        email: user.email // 👈 include email instead of mobileNumber

      }, 
      jwtSecret, 
      { expiresIn: '24h' } // Extended expiry for better UX
    );
    

    res.status(200).json({ 
      success: true,
      message: 'Login successful', 
      token, 
      deviceId: newDeviceId,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        hasActiveSubscription: user.hasActiveSubscription
      } 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Google login route


// Session status route
router.get('/session-status', authenticateUser, async(req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        valid: false,
        error: 'User data not foundghfhgfxghfsghfghfxghxfghsxdfg',
        forceLogout: true 
      });
    }

    res.json({ 
      valid: true, 
      user: {
        userId: req.userId,
        // firstName: req.user.firstName,
        // lastName: req.user.lastName,
        email: req.email,
        mobileNumber: req.ByPhoneNumber,
        // hasActiveSubscription: req.user.hasActiveSubscription
      },
      deviceId: req.deviceId 
    });
  } catch (error) {
    console.error('Session status error:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Internal server error',
      forceLogout: true 
    });
  }
});

// User profile routes
router.get('/user/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/user/profile', authenticateUser, async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email, mobileNumber },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      mobileNumber: updatedUser.mobileNumber,
      hasActiveSubscription: updatedUser.hasActiveSubscription
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // Clear the device ID to invalidate the session
    await User.findByIdAndUpdate(req.user._id, {
      currentDeviceId: null,
      deviceFingerprint: null
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subscription management
router.post('/subscription/activate', authenticateUser, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      hasActiveSubscription: true
    });
    res.json({ message: 'Subscription activated successfully' });
  } catch (error) {
    console.error('Subscription activation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/subscription/deactivate', authenticateUser, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      hasActiveSubscription: false,
      currentDeviceId: null,
      deviceFingerprint: null
    });

    res.json({ 
      message: 'Subscription deactivated. You will be logged out.',
      forceLogout: true 
    });
  } catch (error) {
    console.error('Subscription deactivation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this route to your login.js file for debugging

// Debug token endpoint - REMOVE THIS IN PRODUCTION
router.post('/debug-token', async (req, res) => {
  try {
    const { token } = req.body;
    const jwtSecret = process.env.JWT_SECRET || 'anykey';
    
    console.log('=== TOKEN DEBUG ===');
    console.log('Received token:', token ? token.substring(0, 20) + '...' : 'undefined');
    console.log('JWT Secret:', jwtSecret);
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    try {
      // Decode without verification first
      const decodedWithoutVerify = jwt.decode(token);
      console.log('Decoded without verification:', decodedWithoutVerify);
      
      // Now verify
      const decoded = jwt.verify(token, jwtSecret);
      console.log('Verified token:', decoded);
      
      // Check if user exists
      const user = await User.findOne({ userId: decoded.userId });
      console.log('User exists:', !!user);
      
      res.json({
        success: true,
        decoded: decoded,
        userExists: !!user,
        userInfo: user ? {
          userId: user.userId,
          firstName: user.firstName,
          email: user.email
        } : null
      });
      
    } catch (jwtError) {
      console.log('JWT Error:', jwtError.name, jwtError.message);
      res.status(400).json({
        error: 'Token verification failed',
        details: jwtError.message,
        errorType: jwtError.name
      });
    }
    
  } catch (error) {
    console.error('Debug token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Also add this endpoint to check what's stored in localStorage
router.get('/debug-session', (req, res) => {
  const authHeader = req.header('Authorization');
  
  res.json({
    authHeader: authHeader,
    headerLength: authHeader ? authHeader.length : 0,
    startsWithBearer: authHeader ? authHeader.startsWith('Bearer ') : false,
    extractedToken: authHeader ? (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader) : null
  });
});


// GOOGLE LOGIN ROUTE
// router.post('/auth/google', async (req, res) => {
//   const { token, deviceFingerprint } = req.body;
//   console.log("Received token from frontend:", token);

//   try {
//     // ✅ Properly verify the token with Google's SDK
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: "679832363574-9don8skic3d6n3r8geli6ippcbrip1pe.apps.googleusercontent.com", // from Google Cloud Console
//     });

//     const payload = ticket.getPayload();
//     const { email, name, picture, sub } = googleRes.data;

//     // Check if user exists
//     let user = await User.findOne({ email });
//         const newDeviceId = generateDeviceId();

//     if (!user) {
//       // Create new user
//       user = new User({
//         firstName: name,
//         email,
//         // googleId: sub,
//         // profileImage: picture,
//         // any other defaults
    
//       });
//       await user.save();
//     }
//        if (!deviceFingerprint) {
//       return res.status(400).json({ success: false, error: 'Device fingerprint is required' });
//     }


//     //   await User.findByIdAndUpdate(user._id, {
//     //   currentDeviceId: newDeviceId,
//     //   lastLoginTime: new Date(),
//     //   deviceFingerprint: deviceFingerprint
//     // });

//     // Generate JWT
//     const tokenG = jwt.sign(
//       { userId: user.userId, mobileNumber: user.mobileNumber, email: user.email,        deviceId: newDeviceId,  
//  },
//       jwtSecret,
//       { expiresIn: '1h' }
//   );


//     res.json({ token: tokenG, deviceId: newDeviceId, user });
//   } catch (err) {
//     console.error("Google login error", err.message);
//     res.status(401).json({ error: "Invalid Google token" });
//   }
// });

// FIXED GOOGLE LOGIN ROUTE
router.post('/auth/google', async (req, res) => {
  const { token, deviceFingerprint } = req.body;
  console.log("Received token from frontend:", token);
  
  try {
    // ✅ Properly verify the token with Google's SDK
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "679832363574-9don8skic3d6n3r8geli6ippcbrip1pe.apps.googleusercontent.com", // Replace with your actual client ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload; // ✅ Fixed: Use payload instead of googleRes.data
    
    console.log("Google payload:", payload);
    
    // Validate required data
    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Google token - missing required fields' 
      });
    }
    
    if (!deviceFingerprint) {
      return res.status(400).json({ 
        success: false, 
        error: 'Device fingerprint is required' 
      });
    }
    
    const newDeviceId = generateDeviceId();
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with proper field mapping
      const [firstName, ...lastNameParts] = name.split(' ');
      user = new User({
        userId: sub, // Use Google's unique identifier
        firstName: firstName,
        lastName: lastNameParts.join(' ') || '', // Handle cases where there's no last name
        email,
        currentDeviceId: newDeviceId,
        lastLoginTime: new Date(),
        deviceFingerprint: deviceFingerprint,
        // profileImage: picture, // Uncomment if you have this field in your schema
      });
      await user.save();
    } else {
      // Update existing user's device information
      user.currentDeviceId = newDeviceId;
      user.lastLoginTime = new Date();
      user.deviceFingerprint = deviceFingerprint;
      await user.save();
    }
    
    // Generate JWT
    const tokenG = jwt.sign(
      { 
        userId: user.userId, 
        mobileNumber: user.mobileNumber, 
        email: user.email,
        deviceId: newDeviceId,
      },
      jwtSecret,
      { expiresIn: '1h' }
    );
    
    res.json({ 
      success: true, 
      token: tokenG, 
      deviceId: newDeviceId, 
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
    
  } catch (err) {
    console.error("Google login error:", err);
    
    // More specific error handling
    if (err.message.includes('Invalid token')) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid Google token" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Internal server error during Google authentication" 
    });
  }
});

module.exports = router;