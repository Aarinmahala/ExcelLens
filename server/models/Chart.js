const mongoose = require('mongoose');

const ChartSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['bar', 'line', 'pie', 'scatter', 'bar3d', 'line3d', 'scatter3d']
  },
  xAxis: {
    label: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },
  yAxis: {
    label: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },
  configuration: {
    colors: [String],
    theme: String,
    options: mongoose.Schema.Types.Mixed
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  downloadCount: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upload: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
ChartSchema.index({ user: 1, createdAt: -1 });
ChartSchema.index({ upload: 1 });
ChartSchema.index({ type: 1 });

// Middleware to update user's chart count
ChartSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.user, { $inc: { chartCount: 1 } });
  } catch (error) {
    console.error('Error updating user chart count:', error);
  }
});

module.exports = mongoose.model('Chart', ChartSchema); 