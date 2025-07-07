const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Chart = require('../models/Chart');
const Upload = require('../models/Upload');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/charts
// @desc    Create a new chart
// @access  Private
router.post('/', auth, [
  body('uploadId').notEmpty().withMessage('Upload ID is required'),
  body('title').notEmpty().withMessage('Chart title is required'),
  body('type').isIn(['bar', 'line', 'pie', 'scatter', 'bar3d', 'line3d', 'scatter3d'])
    .withMessage('Invalid chart type'),
  body('xAxis.label').notEmpty().withMessage('X-axis label is required'),
  body('yAxis.label').notEmpty().withMessage('Y-axis label is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { uploadId, title, type, xAxis, yAxis, configuration, tags } = req.body;

    // Verify upload exists and belongs to user
    const upload = await Upload.findOne({
      _id: uploadId,
      user: req.user.id,
      status: 'completed'
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found or not accessible'
      });
    }

    // Validate that specified columns exist in the upload
    if (!upload.headers.includes(xAxis.label) || !upload.headers.includes(yAxis.label)) {
      return res.status(400).json({
        success: false,
        message: 'Specified axes columns do not exist in the uploaded data'
      });
    }

    // Extract data for the specified axes
    const xAxisData = upload.data.map(row => row[xAxis.label]).filter(val => val !== null && val !== undefined);
    const yAxisData = upload.data.map(row => row[yAxis.label]).filter(val => val !== null && val !== undefined);

    if (xAxisData.length === 0 || yAxisData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found for the specified axes'
      });
    }

    // Create chart
    const chart = new Chart({
      user: req.user.id,
      upload: uploadId,
      title,
      type,
      xAxis: {
        label: xAxis.label,
        data: xAxisData
      },
      yAxis: {
        label: yAxis.label,
        data: yAxisData
      },
      configuration: configuration || {},
      tags: tags || []
    });

    await chart.save();

    // Update user chart count
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { chartCount: 1 } 
    });

    // Populate upload information for response
    await chart.populate('upload', 'originalName createdAt');

    res.status(201).json({
      success: true,
      message: 'Chart created successfully',
      chart
    });

  } catch (error) {
    console.error('Create chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during chart creation'
    });
  }
});

// @route   GET /api/charts
// @desc    Get user's charts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type, search } = req.query;

    // Build filter query
    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const charts = await Chart.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('upload', 'originalName createdAt')
      .select('-xAxis.data -yAxis.data'); // Exclude data arrays for performance

    const total = await Chart.countDocuments(filter);

    res.json({
      success: true,
      charts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get charts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/charts/:id
// @desc    Get specific chart details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const chart = await Chart.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('upload', 'originalName createdAt headers');

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    res.json({
      success: true,
      chart
    });
  } catch (error) {
    console.error('Get chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/charts/:id
// @desc    Update chart
// @access  Private
router.put('/:id', auth, [
  body('title').optional().notEmpty().withMessage('Chart title cannot be empty'),
  body('type').optional().isIn(['bar', 'line', 'pie', 'scatter', 'bar3d', 'line3d', 'scatter3d'])
    .withMessage('Invalid chart type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, type, configuration, tags, isPublic } = req.body;

    const chart = await Chart.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    // Update fields
    if (title) chart.title = title;
    if (type) chart.type = type;
    if (configuration) chart.configuration = { ...chart.configuration, ...configuration };
    if (tags !== undefined) chart.tags = tags;
    if (isPublic !== undefined) chart.isPublic = isPublic;

    await chart.save();

    res.json({
      success: true,
      message: 'Chart updated successfully',
      chart
    });
  } catch (error) {
    console.error('Update chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/charts/:id
// @desc    Delete chart
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const chart = await Chart.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    await Chart.findByIdAndDelete(req.params.id);

    // Update user chart count
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { chartCount: -1 } 
    });

    res.json({
      success: true,
      message: 'Chart deleted successfully'
    });
  } catch (error) {
    console.error('Delete chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/charts/:id/download
// @desc    Record chart download
// @access  Private
router.post('/:id/download', auth, async (req, res) => {
  try {
    const chart = await Chart.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    // Increment download count
    chart.downloadCount += 1;
    await chart.save();

    res.json({
      success: true,
      message: 'Download recorded successfully',
      downloadCount: chart.downloadCount
    });
  } catch (error) {
    console.error('Record download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/charts/types/summary
// @desc    Get chart types summary
// @access  Private
router.get('/types/summary', auth, async (req, res) => {
  try {
    // Get chart type summary
    const chartsByType = await Chart.aggregate([
      { $match: { user: req.user.id } },
      { 
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get total uploads for the user
    const user = await User.findById(req.user.id).select('uploadCount chartCount');
    
    // Calculate total charts and downloads
    const totalCharts = chartsByType.reduce((acc, item) => acc + item.count, 0);
    const totalDownloads = chartsByType.reduce((acc, item) => acc + item.totalDownloads, 0);
    
    // Calculate total data points (estimate)
    const dataPointsEstimate = totalCharts * 100; // Rough estimate
    
    // Format the response to match the client expectations
    const formattedChartsByType = chartsByType.map(item => ({
      type: item._id,
      count: item.count,
      totalDownloads: item.totalDownloads
    }));
    
    res.json({
      success: true,
      totalUploads: user?.uploadCount || 0,
      totalCharts: totalCharts,
      totalDataPoints: dataPointsEstimate.toString(),
      totalDownloads: totalDownloads,
      chartsByType: formattedChartsByType
    });
  } catch (error) {
    console.error('Get chart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 