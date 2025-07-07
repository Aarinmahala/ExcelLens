const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { auth } = require('../middleware/auth');
const Upload = require('../models/Upload');
const User = require('../models/User');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `excel-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  
  if (allowedTypes.includes(file.mimetype) || 
      file.originalname.match(/\.(xlsx|xls)$/)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/upload
// @desc    Upload and parse Excel file
// @access  Private
router.post('/', auth, upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { filename, originalname, path: filePath, size, mimetype } = req.file;

    // Create upload record
    const uploadRecord = new Upload({
      user: req.user.id,
      fileName: filename,
      originalName: originalname,
      filePath: filePath,
      fileSize: size,
      mimeType: mimetype,
      status: 'processing'
    });

    try {
      // Parse Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      
      if (sheetNames.length === 0) {
        throw new Error('No worksheets found in the Excel file');
      }

      // Use the first sheet
      const worksheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        throw new Error('No data found in the Excel file');
      }

      // Extract headers (first row)
      const headers = jsonData[0].map(header => 
        typeof header === 'string' ? header.trim() : String(header)
      ).filter(header => header && header !== '');

      // Extract data rows (excluding header)
      const dataRows = jsonData.slice(1).filter(row => 
        row.some(cell => cell !== null && cell !== undefined && cell !== '')
      );

      // Convert to object format
      const formattedData = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });

      // Update upload record
      uploadRecord.headers = headers;
      uploadRecord.rowCount = dataRows.length;
      uploadRecord.columnCount = headers.length;
      uploadRecord.data = formattedData;
      uploadRecord.status = 'completed';

      await uploadRecord.save();

      // Update user upload count
      await User.findByIdAndUpdate(req.user.id, { 
        $inc: { uploadCount: 1 } 
      });

      res.json({
        success: true,
        message: 'File uploaded and parsed successfully',
        upload: {
          id: uploadRecord._id,
          fileName: uploadRecord.originalName,
          headers: uploadRecord.headers,
          rowCount: uploadRecord.rowCount,
          columnCount: uploadRecord.columnCount,
          uploadedAt: uploadRecord.createdAt
        },
        preview: formattedData.slice(0, 5) // First 5 rows for preview
      });

    } catch (parseError) {
      console.error('Parse error:', parseError);
      
      // Update upload record with error
      uploadRecord.status = 'failed';
      uploadRecord.errorMessage = parseError.message;
      await uploadRecord.save();

      // Delete the uploaded file since parsing failed
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(400).json({
        success: false,
        message: 'Failed to parse Excel file',
        error: parseError.message
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// @route   GET /api/upload/history
// @desc    Get user's upload history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const uploads = await Upload.find({ user: req.user.id })
      .select('-data') // Exclude data field for performance
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    const total = await Upload.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      uploads,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/upload/:id
// @desc    Get specific upload details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email');

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    res.json({
      success: true,
      upload
    });
  } catch (error) {
    console.error('Get upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/upload/:id
// @desc    Delete upload and associated file
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Delete physical file
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

    // Delete upload record
    await Upload.findByIdAndDelete(req.params.id);

    // Update user upload count
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { uploadCount: -1 } 
    });

    res.json({
      success: true,
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only Excel files (.xlsx, .xls) are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router; 