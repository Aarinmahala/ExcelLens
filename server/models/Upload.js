const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String
  },
  headers: {
    type: [String],
    required: true
  },
  rowCount: {
    type: Number,
    required: true
  },
  columnCount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  errorMessage: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update user's upload count
UploadSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.user, { $inc: { uploadCount: 1 } });
  } catch (error) {
    console.error('Error updating user upload count:', error);
  }
});

module.exports = mongoose.model('Upload', UploadSchema); 