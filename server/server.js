const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { config, getEndpointPath } = require('./config');
const { connectDB, disconnectDB, isConnectedToDB } = require('./db');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const chartRoutes = require('./routes/charts');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet(config.security.helmet));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimiting.windowMs,
  max: config.security.rateLimiting.max,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, config.uploads.path)));

// Mock data for testing
const mockUsers = [
  { 
    _id: '1', 
    name: 'Test User', 
    email: 'user@example.com', 
    password: 'password123', 
    role: 'user',
    isActive: true,
    lastLogin: new Date(),
    uploadCount: 5,
    chartCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) // 30 days ago
  },
  { 
    _id: '2', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    password: 'password123', 
    role: 'admin',
    isActive: true,
    lastLogin: new Date(),
    uploadCount: 10,
    chartCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) // 60 days ago
  }
];

const mockUploads = [
  {
    id: '1',
    user: '1',
    originalName: 'Sales_Report_2023.xlsx',
    filename: 'sales_report_2023_1234567890.xlsx',
    path: '/uploads/sales_report_2023_1234567890.xlsx',
    size: 1024 * 1024 * 2, // 2MB
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    headers: ['Date', 'Product', 'Region', 'Sales', 'Profit'],
    rowCount: 120,
    columnCount: 5,
    status: 'completed',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    data: [] // Simplified for mock
  },
  {
    id: '2',
    user: '1',
    originalName: 'Customer_Feedback_Q2.xlsx',
    filename: 'customer_feedback_q2_0987654321.xlsx',
    path: '/uploads/customer_feedback_q2_0987654321.xlsx',
    size: 1024 * 1024 * 1.5, // 1.5MB
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    headers: ['Date', 'Customer ID', 'Rating', 'Comment', 'Product'],
    rowCount: 85,
    columnCount: 5,
    status: 'completed',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    data: [] // Simplified for mock
  },
  {
    id: '3',
    user: '2',
    originalName: 'Marketing_Campaign_Results.xlsx',
    filename: 'marketing_campaign_results_1122334455.xlsx',
    path: '/uploads/marketing_campaign_results_1122334455.xlsx',
    size: 1024 * 1024 * 3, // 3MB
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    headers: ['Campaign', 'Channel', 'Spend', 'Clicks', 'Conversions', 'Revenue'],
    rowCount: 45,
    columnCount: 6,
    status: 'completed',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 48 hours ago
    data: [] // Simplified for mock
  }
];

const mockCharts = [
  {
    id: '1',
    user: '1',
    upload: '1',
    title: 'Monthly Sales by Region',
    type: 'bar',
    xAxis: {
      label: 'Date',
      data: [] // Simplified for mock
    },
    yAxis: {
      label: 'Sales',
      data: [] // Simplified for mock
    },
    configuration: {
      colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'],
      theme: 'light'
    },
    downloadCount: 12,
    isPublic: true,
    tags: ['sales', 'monthly', 'region'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: '2',
    user: '1',
    upload: '2',
    title: 'Customer Satisfaction Trends',
    type: 'line',
    xAxis: {
      label: 'Date',
      data: [] // Simplified for mock
    },
    yAxis: {
      label: 'Rating',
      data: [] // Simplified for mock
    },
    configuration: {
      colors: ['#10B981', '#4F46E5'],
      theme: 'light'
    },
    downloadCount: 8,
    isPublic: true,
    tags: ['customer', 'satisfaction', 'trends'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() // 10 hours ago
  },
  {
    id: '3',
    user: '1',
    upload: '2',
    title: 'Product Feedback Distribution',
    type: 'pie',
    xAxis: {
      label: 'Product',
      data: [] // Simplified for mock
    },
    yAxis: {
      label: 'Rating',
      data: [] // Simplified for mock
    },
    configuration: {
      colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      theme: 'light'
    },
    downloadCount: 5,
    isPublic: false,
    tags: ['product', 'feedback', 'distribution'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() // 8 hours ago
  },
  {
    id: '4',
    user: '2',
    upload: '3',
    title: 'Marketing ROI Analysis',
    type: 'bar',
    xAxis: {
      label: 'Campaign',
      data: [] // Simplified for mock
    },
    yAxis: {
      label: 'ROI',
      data: [] // Simplified for mock
    },
    configuration: {
      colors: ['#F59E0B', '#4F46E5'],
      theme: 'dark'
    },
    downloadCount: 15,
    isPublic: true,
    tags: ['marketing', 'roi', 'campaign'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() // 36 hours ago
  },
  {
    id: '5',
    user: '2',
    upload: '3',
    title: 'Channel Performance Comparison',
    type: 'line',
    xAxis: {
      label: 'Channel',
      data: [] // Simplified for mock
    },
    yAxis: {
      label: 'Conversions',
      data: [] // Simplified for mock
    },
    configuration: {
      colors: ['#8B5CF6', '#10B981', '#F59E0B'],
      theme: 'light'
    },
    downloadCount: 7,
    isPublic: true,
    tags: ['channel', 'performance', 'marketing'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() // 30 hours ago
  }
];

// Mock auth route for testing without MongoDB
app.post(getEndpointPath('auth', 'login'), (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  // Find user by email
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    console.log('Login failed: User not found');
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials - User not found. Use user@example.com or admin@example.com'
    });
  }
  
  // In mock mode, we only accept 'password123'
  if (password !== 'password123') {
    console.log('Login failed: Invalid password. Required: password123, Received:', password);
    return res.status(401).json({
      success: false,
      message: 'Invalid password - Please use "password123"'
    });
  }
  
  // Generate a mock token that includes the user ID
  const token = `mock-jwt-token-${user._id}-${Date.now()}`;
  
  // Log the successful login
  console.log('Login successful:', { userId: user._id, role: user.role, token });
  
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      uploadCount: user.uploadCount || 5, // Use actual value or mock data
      chartCount: user.chartCount || 3, // Use actual value or mock data
      lastLogin: new Date(),
      createdAt: user.createdAt || new Date()
    }
  });
});

app.get(getEndpointPath('auth', 'me'), (req, res) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token received:', token);
  
  // In a real app, we'd verify the JWT token
  // For this mock, we'll check if the token contains a user ID
  const tokenParts = token.split('-');
  if (tokenParts.length < 3 || !tokenParts[2]) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  const userId = tokenParts[2];
  const user = mockUsers.find(u => u._id === userId);
  
  if (!user) {
    // If we can't find the user, return the first user as fallback
    const fallbackUser = mockUsers[0];
    console.log('User not found for token, using fallback user:', fallbackUser._id);
    
    return res.json({
      success: true,
      user: {
        id: fallbackUser._id,
        name: fallbackUser.name,
        email: fallbackUser.email,
        role: fallbackUser.role,
        uploadCount: fallbackUser.uploadCount,
        chartCount: fallbackUser.chartCount,
        lastLogin: fallbackUser.lastLogin,
        createdAt: new Date()
      }
    });
  }
  
  console.log('User authenticated:', { userId: user._id, role: user.role });
  
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      uploadCount: user.uploadCount,
      chartCount: user.chartCount,
      lastLogin: user.lastLogin,
      createdAt: new Date()
    }
  });
});

// Mock upload history endpoint
app.get(getEndpointPath('upload', 'getAll'), (req, res) => {
  const { auth } = require('./middleware/auth');
  
  // Apply auth middleware manually
  auth(req, res, () => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Filter uploads by user
      const userUploads = mockUploads.filter(upload => {
        // If user ID is a string, compare directly
        if (typeof req.user._id === 'string') {
          return upload.user === req.user._id;
        }
        // If user ID is an ObjectId, convert to string for comparison
        return upload.user === req.user._id.toString();
      });
      
      res.json({
        success: true,
        uploads: userUploads,
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: userUploads.length,
          hasNext: false,
          hasPrev: false
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
});

// Mock chart summary endpoint
app.get(getEndpointPath('charts', 'summary'), (req, res) => {
  const { auth } = require('./middleware/auth');
  
  // Apply auth middleware manually
  auth(req, res, () => {
    try {
      // Filter charts by user
      const userCharts = mockCharts.filter(chart => {
        // If user ID is a string, compare directly
        if (typeof req.user._id === 'string') {
          return chart.user === req.user._id;
        }
        // If user ID is an ObjectId, convert to string for comparison
        return chart.user === req.user._id.toString();
      });
      
      // Count charts by type and calculate total downloads
      const chartTypes = {};
      let totalDownloads = 0;
      
      userCharts.forEach(chart => {
        if (!chartTypes[chart.type]) {
          chartTypes[chart.type] = {
            type: chart.type,
            count: 0,
            totalDownloads: 0
          };
        }
        chartTypes[chart.type].count += 1;
        chartTypes[chart.type].totalDownloads += chart.downloadCount || 0;
        totalDownloads += chart.downloadCount || 0;
      });
      
      // Get total uploads from mock data
      const userUploads = mockUploads.filter(upload => {
        if (typeof req.user._id === 'string') {
          return upload.user === req.user._id;
        }
        return upload.user === req.user._id.toString();
      });
      
      // Calculate total data points (just a mock value)
      const totalDataPoints = userUploads.reduce((sum, upload) => sum + (upload.rowCount || 0) * (upload.columnCount || 0), 0);
      
      // Create the summary object with the expected structure
      const summary = {
        totalUploads: userUploads.length,
        totalCharts: userCharts.length,
        totalDataPoints: totalDataPoints.toString(),
        totalDownloads: totalDownloads,
        chartsByType: Object.values(chartTypes)
      };
      
      res.json({
        success: true,
        summary: summary
      });
    } catch (error) {
      console.error('Get chart summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });
});

// Mock charts endpoint
app.get(getEndpointPath('charts', 'getAll'), (req, res) => {
  const { auth } = require('./middleware/auth');
  
  // Apply auth middleware manually
  auth(req, res, () => {
    try {
      // Filter charts by user
      const userCharts = mockCharts.filter(chart => {
        // If user ID is a string, compare directly
        if (typeof req.user._id === 'string') {
          return chart.user === req.user._id;
        }
        // If user ID is an ObjectId, convert to string for comparison
        return chart.user === req.user._id.toString();
      });
      
      res.json({
        success: true,
        charts: userCharts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: userCharts.length,
          hasNext: false,
          hasPrev: false
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
});

// Health check route
app.get(getEndpointPath('health', 'check'), (req, res) => {
  res.json({ 
    message: 'Excel Analytics Platform API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.environment,
    mongoDbConnected: isConnectedToDB()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: config.server.environment === 'development' ? err : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB but don't stop server if it fails
    let dbConnected = false;
    try {
      await connectDB();
      dbConnected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.log('❌ Failed to connect to MongoDB');
      console.log('⚠️ Running in mock mode (MongoDB not connected)');
    }

    // Start the server regardless of MongoDB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log('📊 Excel Analytics Platform API');
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (!dbConnected) {
        console.log('⚠️ Running in mock mode (MongoDB not connected)');
        console.log('👤 Use these credentials to login:');
        console.log('   - User: user@example.com / password123');
        console.log('   - Admin: admin@example.com / password123');
      }
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await disconnectDB();
  process.exit(0);
}); 