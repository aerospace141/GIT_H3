// routes/studentAnnouncements.js
const express = require('express');
const router = express.Router();
const Announcement = require('../../models/Announcement');
const User = require('../../models/user');
const { authenticateUser } = require('../../middleware/authentication');
// Get announcements for student (filtered by group and not hidden)
router.get('/student/announcements', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user data using the userId from token
    const user = await User.findOne({ userId }).select('_id group hiddenAnnouncements');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get hidden announcement IDs (convert to string for comparison)
    const hiddenIds = user.hiddenAnnouncements?.map(h => h.announcementId.toString()) || [];

    // Find announcements for this user's group or 'all'
    let query = {
      $or: [
        { targetGroup: 'all' }
      ]
    };

    // Add user's group to query if they have one
    if (user.group) {
      query.$or.push({ targetGroup: user.group });
    }

    // Exclude hidden announcements
    if (hiddenIds.length > 0) {
      query._id = { $nin: hiddenIds.map(id => id) };
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    // Add read status for each announcement
    const announcementsWithStatus = announcements.map(announcement => {
      // Check if this user has read this announcement
      const isRead = announcement.readBy?.some(readEntry => 
        readEntry.studentId && readEntry.studentId.toString() === user._id.toString()
      );
      
      return {
        ...announcement.toObject(),
        isRead: isRead || false,
        canHide: true,
        createdByName: announcement.createdBy ? 
          `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}` : 
          'Administrator'
      };
    });

    res.json({
      announcements: announcementsWithStatus,
      totalCount: announcementsWithStatus.length,
      unreadCount: announcementsWithStatus.filter(a => !a.isRead).length
    });
  } catch (error) {
    console.error('Error fetching student announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Mark announcement as read
router.post('/student/announcements/:id/read', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const announcementId = req.params.id;
    
    // Get user using userId from token
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Initialize readBy array if it doesn't exist
    if (!announcement.readBy) {
      announcement.readBy = [];
    }

    // Check if already read by this user
    const alreadyRead = announcement.readBy.some(readEntry => 
      readEntry.studentId && readEntry.studentId.toString() === user._id.toString()
    );
    
    if (!alreadyRead) {
      // Add user to readBy array
      announcement.readBy.push({
        studentId: user._id,
        readAt: new Date()
      });
      
      await announcement.save();
    }

    res.json({ 
      message: 'Announcement marked as read',
      isRead: true 
    });
  } catch (error) {
    console.error('Error marking announcement as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Hide announcement for this student only
router.post('/student/announcements/:id/hide', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const announcementId = req.params.id;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if announcement exists
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Initialize hiddenAnnouncements array if it doesn't exist
    if (!user.hiddenAnnouncements) {
      user.hiddenAnnouncements = [];
    }

    // Check if already hidden
    const alreadyHidden = user.hiddenAnnouncements.some(
      h => h.announcementId.toString() === announcementId
    );

    if (!alreadyHidden) {
      user.hiddenAnnouncements.push({
        announcementId,
        hiddenAt: new Date()
      });
      
      await user.save();
    }

    res.json({ 
      message: 'Announcement hidden successfully',
      isHidden: true 
    });
  } catch (error) {
    console.error('Error hiding announcement:', error);
    res.status(500).json({ error: 'Failed to hide announcement' });
  }
});

// Unhide announcement (if student wants to see it again)
router.post('/student/announcements/:id/unhide', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const announcementId = req.params.id;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from hidden announcements
    if (user.hiddenAnnouncements) {
      user.hiddenAnnouncements = user.hiddenAnnouncements.filter(
        h => h.announcementId.toString() !== announcementId
      );
      
      await user.save();
    }

    res.json({ 
      message: 'Announcement unhidden successfully',
      isHidden: false 
    });
  } catch (error) {
    console.error('Error unhiding announcement:', error);
    res.status(500).json({ error: 'Failed to unhide announcement' });
  }
});

// Get hidden announcements (if student wants to manage them)
router.get('/student/announcements/hidden', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findOne({ userId })
      .populate({
        path: 'hiddenAnnouncements.announcementId',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName'
        }
      });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hiddenAnnouncements = user.hiddenAnnouncements?.map(h => ({
      ...h.announcementId.toObject(),
      hiddenAt: h.hiddenAt,
      createdByName: `${h.announcementId.createdBy.firstName} ${h.announcementId.createdBy.lastName}`
    })) || [];

    res.json({
      hiddenAnnouncements,
      count: hiddenAnnouncements.length
    });
  } catch (error) {
    console.error('Error fetching hidden announcements:', error);
    res.status(500).json({ error: 'Failed to fetch hidden announcements' });
  }
});

module.exports = router;