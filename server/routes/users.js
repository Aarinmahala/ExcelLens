const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Upload = require('../models/Upload');
const Chart = require('../models/Chart');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, role, isActive } = req.query;

    // Build filter query
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get platform statistics (Admin only)
// @access  Private/Admin
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const totalUploads = await Upload.countDocuments();
    const successfulUploads = await Upload.countDocuments({ status: 'completed' });
    const totalCharts = await Chart.countDocuments();

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const recentUploads = await Upload.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const recentCharts = await Chart.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Chart type distribution
    const chartTypeDistribution = await Chart.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Most active users
    const topUsers = await User.find({ isActive: true })
      .select('name email uploadCount chartCount lastLogin')
      .sort({ uploadCount: -1, chartCount: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          activeUsers,
          adminUsers,
          totalUploads,
          successfulUploads,
          totalCharts
        },
        recent: {
          newUsers: recentUsers,
          newUploads: recentUploads,
          newCharts: recentCharts
        },
        chartTypes: chartTypeDistribution,
        topUsers
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user details (Admin only)
// @access  Private/Admin
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's recent activity
    const recentUploads = await Upload.find({ user: req.params.id })
      .select('originalName status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCharts = await Chart.find({ user: req.params.id })
      .select('title type createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      user,
      recentActivity: {
        uploads: recentUploads,
        charts: recentCharts
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private/Admin
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === req.params.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/:id/role', auth, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role to user
    if (req.user.id === req.params.id && role === 'user') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role to user'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user and all associated data (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Delete user's uploads, charts, and files
    const uploads = await Upload.find({ user: req.params.id });
    
    // Delete physical files
    const fs = require('fs');
    uploads.forEach(upload => {
      if (fs.existsSync(upload.filePath)) {
        fs.unlinkSync(upload.filePath);
      }
    });

    // Delete database records
    await Upload.deleteMany({ user: req.params.id });
    await Chart.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 