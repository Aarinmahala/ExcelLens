const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Chart title is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Chart type is required'],
    enum: ['bar', 'line', 'pie', 'scatter', 'bar3d', 'line3d', 'scatter3d']
  },
  xAxis: {
    label: {
      type: String,
      required: true
    },
    data: [mongoose.Schema.Types.Mixed]
  },
  yAxis: {
    label: {
      type: String,
      required: true
    },
    data: [mongoose.Schema.Types.Mixed]
  },
  configuration: {
    colors: [String],
    theme: {
      type: String,
      default: 'default'
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  aiInsights: {
    summary: String,
    trends: [String],
    recommendations: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
chartSchema.index({ user: 1, createdAt: -1 });
chartSchema.index({ upload: 1 });
chartSchema.index({ type: 1 });

module.exports = mongoose.model('Chart', chartSchema); 