/**
 * Database Initialization Script
 * 
 * This script initializes the MongoDB database with sample data.
 * It creates users, uploads, and charts for testing purposes.
 * 
 * Run with: node scripts/init-db.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { config } = require('../config');
const { connectDB, disconnectDB } = require('../db');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Test User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'john123',
    role: 'user'
  }
];

const sampleUploads = [
  {
    fileName: 'sales_data_2023.xlsx',
    originalName: 'Sales Data 2023.xlsx',
    fileSize: 25600,
    headers: ['Month', 'Product', 'Revenue', 'Units Sold', 'Region'],
    rowCount: 120,
    columnCount: 5,
    status: 'completed'
  },
  {
    fileName: 'customer_survey.xlsx',
    originalName: 'Customer Survey Results.xlsx',
    fileSize: 18400,
    headers: ['Customer ID', 'Age', 'Gender', 'Satisfaction', 'Feedback'],
    rowCount: 85,
    columnCount: 5,
    status: 'completed'
  },
  {
    fileName: 'inventory_q1.xlsx',
    originalName: 'Inventory Q1 2023.xlsx',
    fileSize: 32000,
    headers: ['Product ID', 'Product Name', 'Category', 'Stock', 'Price', 'Supplier'],
    rowCount: 150,
    columnCount: 6,
    status: 'completed'
  }
];

const sampleCharts = [
  {
    title: 'Monthly Sales Revenue',
    description: 'Bar chart showing monthly sales revenue for 2023',
    type: 'bar',
    xAxis: {
      label: 'Month',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: {
      label: 'Revenue ($)',
      data: [12500, 17800, 14300, 19500, 16700, 21200]
    },
    configuration: {
      colors: ['#4c78a8', '#72b7b2', '#54a24b', '#eeca3b', '#e45756', '#b279a2'],
      theme: 'light'
    },
    isPublic: true,
    tags: ['sales', 'revenue', 'monthly']
  },
  {
    title: 'Customer Satisfaction by Age Group',
    description: 'Pie chart showing customer satisfaction distribution across age groups',
    type: 'pie',
    xAxis: {
      label: 'Age Group',
      data: ['18-24', '25-34', '35-44', '45-54', '55+']
    },
    yAxis: {
      label: 'Satisfaction Score',
      data: [3.8, 4.2, 3.9, 4.5, 4.7]
    },
    configuration: {
      colors: ['#4c78a8', '#72b7b2', '#54a24b', '#eeca3b', '#e45756'],
      theme: 'light'
    },
    isPublic: false,
    tags: ['customer', 'satisfaction', 'demographics']
  },
  {
    title: 'Product Stock Levels',
    description: 'Line chart showing inventory levels for top products',
    type: 'line',
    xAxis: {
      label: 'Product',
      data: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
    },
    yAxis: {
      label: 'Stock',
      data: [145, 87, 203, 127, 92]
    },
    configuration: {
      colors: ['#4c78a8'],
      theme: 'dark'
    },
    isPublic: true,
    tags: ['inventory', 'stock', 'products']
  }
];

/**
 * Initialize the database with sample data
 */
const initializeDatabase = async () => {
  console.log(`${colors.cyan}=== Excel Analytics Platform Database Initialization ===${colors.reset}`);
  
  try {
    // Connect to MongoDB
    console.log(`${colors.yellow}Connecting to MongoDB...${colors.reset}`);
    const connected = await connectDB();
    
    if (!connected) {
      console.log(`${colors.red}❌ Failed to connect to MongoDB. Aborting initialization.${colors.reset}`);
      return;
    }
    
    console.log(`${colors.green}✅ Connected to MongoDB${colors.reset}`);
    
    // Import models
    console.log(`${colors.blue}Loading models...${colors.reset}`);
    const User = require('../models/User');
    const Upload = require('../models/Upload');
    const Chart = require('../models/Chart');
    
    // Check if database is already initialized
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`${colors.yellow}⚠️ Database already contains data. Do you want to clear it and reinitialize?${colors.reset}`);
      console.log(`${colors.yellow}Press Ctrl+C to cancel or wait 5 seconds to continue...${colors.reset}`);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Clear existing data
      console.log(`${colors.yellow}Clearing existing data...${colors.reset}`);
      await Chart.deleteMany({});
      await Upload.deleteMany({});
      await User.deleteMany({});
      console.log(`${colors.green}✅ Existing data cleared${colors.reset}`);
    }
    
    // Create users
    console.log(`${colors.blue}Creating sample users...${colors.reset}`);
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      
      createdUsers.push(user);
      console.log(`${colors.green}✅ Created user: ${userData.name} (${userData.email})${colors.reset}`);
    }
    
    // Create uploads
    console.log(`${colors.blue}Creating sample uploads...${colors.reset}`);
    const createdUploads = [];
    
    for (let i = 0; i < sampleUploads.length; i++) {
      const uploadData = sampleUploads[i];
      const user = createdUsers[i % createdUsers.length];
      
      const upload = await Upload.create({
        ...uploadData,
        user: user._id,
        filePath: `/uploads/${uploadData.fileName}`
      });
      
      createdUploads.push(upload);
      console.log(`${colors.green}✅ Created upload: ${uploadData.originalName}${colors.reset}`);
    }
    
    // Create charts
    console.log(`${colors.blue}Creating sample charts...${colors.reset}`);
    
    for (let i = 0; i < sampleCharts.length; i++) {
      const chartData = sampleCharts[i];
      const user = createdUsers[i % createdUsers.length];
      const upload = createdUploads[i % createdUploads.length];
      
      const chart = await Chart.create({
        ...chartData,
        user: user._id,
        upload: upload._id
      });
      
      console.log(`${colors.green}✅ Created chart: ${chartData.title}${colors.reset}`);
    }
    
    console.log(`${colors.cyan}=== Database Initialization Complete ===${colors.reset}`);
    console.log(`${colors.green}✅ Created ${createdUsers.length} users${colors.reset}`);
    console.log(`${colors.green}✅ Created ${createdUploads.length} uploads${colors.reset}`);
    console.log(`${colors.green}✅ Created ${sampleCharts.length} charts${colors.reset}`);
    
    console.log(`\n${colors.magenta}You can now log in with:${colors.reset}`);
    console.log(`${colors.cyan}Admin:${colors.reset} admin@example.com / admin123`);
    console.log(`${colors.cyan}User:${colors.reset} user@example.com / user123`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error initializing database: ${error.message}${colors.reset}`);
  } finally {
    // Disconnect from MongoDB
    await disconnectDB();
    process.exit(0);
  }
};

// Run the initialization
initializeDatabase(); 