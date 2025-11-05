const jwt = require('jsonwebtoken');
const User = require('../models/user');
const jwtSecret = process.env.JWT_SECRET || 'anykey';

const authenticateUser = async (req, res, next) => {
  try {
    let token = req.header('Authorization');
    const deviceIdHeader = req.header('X-Device-Id');

    if (!token || !deviceIdHeader) {
      return res.status(401).json({ message: 'Authorization denied', forceLogout: true });
    }

    // Remove 'Bearer ' prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    const { userId, deviceId, mobileNumber, email } = decoded;

    // Fetch user from DB
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: 'User not found', forceLogout: true });
    }

    console.log("Decoded Token:", decoded);
    console.log("User from DB:", user);
    console.log("User's Current Device ID (DB):", user.currentDeviceId);
    console.log("Token's Device ID:", deviceId);
    console.log("Header Device ID:", deviceIdHeader);

    // Device validation
    if (user.currentDeviceId !== deviceId || user.currentDeviceId !== deviceIdHeader) {
      return res.status(401).json({
        message: 'Session expired - logged in from another device',
        forceLogout: true
      });
    }

    // Check subscription/trial status
    const now = new Date();

    // if (user.trialExpiresAt && now < user.trialExpiresAt) {
    //   // Trial is valid - attach user data and continue
    //   req.userId = userId;
    //   req.mobileNumber = mobileNumber;
    //   req.deviceId = deviceId;
    //   req.email = email;
    //   req.user = user; // Attach full user object
    //   return next();
    // }

    // if (user.hasActiveSubscription && user.subscriptionEnd && now < user.subscriptionEnd) {
    //   // Subscription is valid - attach user data and continue
    //   req.userId = userId;
    //   req.mobileNumber = mobileNumber;
    //   req.deviceId = deviceId;
    //   req.email = email;
    //   req.user = user; // Attach full user object
    //   return next();
    // }
       if (user) {
      // Trial is valid - attach user data and continue
      req.userId = userId;
      req.mobileNumber = mobileNumber;
      req.deviceId = deviceId;
      req.email = email;
      req.user = user; // Attach full user object
      return next();
    }

    if (user) {
      // Subscription is valid - attach user data and continue
      req.userId = userId;
      req.mobileNumber = mobileNumber;
      req.deviceId = deviceId;
      req.email = email;
      req.user = user; // Attach full user object
      return next();
    }

    // Neither trial nor subscription is valid
    return res.status(403).json({
      message: 'Subscription required',
      forceLogout: true
    });

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', forceLogout: true });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format', forceLogout: true });
    }

    return res.status(401).json({ message: 'Authentication failed', forceLogout: true });
  }
};

module.exports = { authenticateUser };