const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const chartRoutes = require('./routes/charts');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mock user for testing when MongoDB is not available
const mockUsers = [
  {
    _id: '1',
    name: 'Test User',
    email: 'user@example.com',
    password: '$2a$12$q0OtCg.qZRx6cCbYJxT8OOyU9GMUPXcGCGJpJq9aDaQT1dHOAlTH6', // password123
    role: 'user',
    isActive: true,
    lastLogin: new Date(),
    uploadCount: 5,
    chartCount: 3
  },
  {
    _id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$12$q0OtCg.qZRx6cCbYJxT8OOyU9GMUPXcGCGJpJq9aDaQT1dHOAlTH6', // password123
    role: 'admin',
    isActive: true,
    lastLogin: new Date(),
    uploadCount: 10,
    chartCount: 8
  }
];

// Mock auth route for testing without MongoDB
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  // Find user by email
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // In a real app, we'd check the password with bcrypt
  // For this mock, we'll just check if the password is 'password123'
  if (password !== 'password123') {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Generate a mock token that includes the user ID
  const token = `mock-jwt-token-${user._id}-${Date.now()}`;
  
  console.log('Login successful:', { userId: user._id, role: user.role, token });
  
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      uploadCount: user.uploadCount,
      chartCount: user.chartCount
    }
  });
});

app.get('/api/auth/me', (req, res) => {
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

// Routes
// app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/users', userRoutes);

// Mock data for uploads and charts
const mockUploads = [
  {
    _id: '1',
    fileName: 'sales_data_2023.xlsx',
    originalName: 'sales_data_2023.xlsx',
    fileSize: 45678,
    headers: ['Date', 'Product', 'Region', 'Sales', 'Profit'],
    rowCount: 120,
    columnCount: 5,
    status: 'completed',
    createdAt: new Date('2023-12-01'),
    user: '1'
  },
  {
    _id: '2',
    fileName: 'customer_analysis.xlsx',
    originalName: 'customer_analysis.xlsx',
    fileSize: 78945,
    headers: ['Customer ID', 'Name', 'Age', 'Location', 'Purchases', 'Lifetime Value'],
    rowCount: 250,
    columnCount: 6,
    status: 'completed',
    createdAt: new Date('2023-12-15'),
    user: '1'
  },
  {
    _id: '3',
    fileName: 'marketing_campaign.xlsx',
    originalName: 'marketing_campaign.xlsx',
    fileSize: 56789,
    headers: ['Campaign', 'Channel', 'Budget', 'ROI', 'Conversions'],
    rowCount: 85,
    columnCount: 5,
    status: 'completed',
    createdAt: new Date('2024-01-10'),
    user: '2'
  },
  {
    _id: '4',
    fileName: 'inventory_report.xlsx',
    originalName: 'inventory_report.xlsx',
    fileSize: 34567,
    headers: ['Product ID', 'Name', 'Category', 'Stock', 'Reorder Level', 'Supplier'],
    rowCount: 320,
    columnCount: 6,
    status: 'completed',
    createdAt: new Date('2024-02-05'),
    user: '2'
  }
];

const mockCharts = [
  {
    _id: '1',
    title: 'Sales by Region',
    description: 'Analysis of sales performance across different regions',
    type: 'bar',
    upload: '1',
    xAxis: 'Region',
    yAxis: 'Sales',
    createdAt: new Date('2023-12-05'),
    user: '1',
    downloadCount: 5
  },
  {
    _id: '2',
    title: 'Profit Margin Trend',
    description: 'Monthly profit margin analysis',
    type: 'line',
    upload: '1',
    xAxis: 'Date',
    yAxis: 'Profit',
    createdAt: new Date('2023-12-10'),
    user: '1',
    downloadCount: 3
  },
  {
    _id: '3',
    title: 'Customer Age Distribution',
    description: 'Distribution of customers by age groups',
    type: 'pie',
    upload: '2',
    xAxis: 'Age',
    yAxis: 'Count',
    createdAt: new Date('2023-12-20'),
    user: '1',
    downloadCount: 2
  },
  {
    _id: '4',
    title: 'Marketing ROI by Channel',
    description: 'Return on investment for different marketing channels',
    type: 'bar',
    upload: '3',
    xAxis: 'Channel',
    yAxis: 'ROI',
    createdAt: new Date('2024-01-15'),
    user: '2',
    downloadCount: 7
  },
  {
    _id: '5',
    title: 'Campaign Performance',
    description: 'Conversion rates across marketing campaigns',
    type: 'line',
    upload: '3',
    xAxis: 'Campaign',
    yAxis: 'Conversions',
    createdAt: new Date('2024-01-20'),
    user: '2',
    downloadCount: 4
  },
  {
    _id: '6',
    title: 'Inventory Status',
    description: 'Current stock levels compared to reorder levels',
    type: 'scatter',
    upload: '4',
    xAxis: 'Product ID',
    yAxis: 'Stock',
    createdAt: new Date('2024-02-10'),
    user: '2',
    downloadCount: 1
  }
];

// Mock upload history endpoint
app.get('/api/upload/history', (req, res) => {
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
app.get('/api/charts/types/summary', (req, res) => {
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
      
      // Count charts by type
      const chartTypes = userCharts.reduce((acc, chart) => {
        acc[chart.type] = (acc[chart.type] || 0) + 1;
        return acc;
      }, {});
      
      res.json({
        success: true,
        summary: Object.keys(chartTypes).map(type => ({
          type,
          count: chartTypes[type]
        }))
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

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Excel Analytics Platform API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server without requiring MongoDB
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Excel Analytics Platform API`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('⚠️ Running in mock mode (MongoDB not connected)');
});

// Try MongoDB connection in the background
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-analytics')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️ Running with mock data only');
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.log('⚠️ No MongoDB connection to close');
  }
  process.exit(0);
}); 