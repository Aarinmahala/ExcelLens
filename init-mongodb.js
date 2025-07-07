// MongoDB initialization script for Excel Analytics Platform

// Switch to excel_analytics database (creates it if it doesn't exist)
print('Creating/using excel_analytics database...');
db = db.getSiblingDB('excel_analytics');

// Create collections
print('Creating collections...');
db.createCollection('users');
db.createCollection('uploads');
db.createCollection('charts');

// Add sample users
print('Adding sample users...');
db.users.insertMany([
  {
    name: 'Test User',
    email: 'user@example.com',
    // This is a bcrypt hash of 'password123'
    password: '$2a$10$rrm7C.SHPDVQqLQwLX2vxuJlKlGQ5xnq.K7RH8YUlPCpPUEH4OvMi',
    role: 'user',
    isActive: true,
    lastLogin: new Date(),
    uploadCount: 5,
    chartCount: 3,
    createdAt: new Date()
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    // This is a bcrypt hash of 'password123'
    password: '$2a$10$rrm7C.SHPDVQqLQwLX2vxuJlKlGQ5xnq.K7RH8YUlPCpPUEH4OvMi',
    role: 'admin',
    isActive: true,
    lastLogin: new Date(),
    uploadCount: 10,
    chartCount: 8,
    createdAt: new Date()
  }
]);

// Add sample uploads
print('Adding sample uploads...');
const user1Id = db.users.findOne({ email: 'user@example.com' })._id;
const user2Id = db.users.findOne({ email: 'admin@example.com' })._id;

db.uploads.insertMany([
  {
    fileName: 'sales_data_2023.xlsx',
    originalName: 'Sales Data 2023.xlsx',
    fileSize: 12345,
    filePath: '/uploads/sales_data_2023.xlsx',
    headers: ['Date', 'Product', 'Region', 'Sales', 'Profit'],
    rowCount: 150,
    columnCount: 5,
    status: 'processed',
    user: user1Id,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  },
  {
    fileName: 'inventory_q2.xlsx',
    originalName: 'Inventory Q2.xlsx',
    fileSize: 8765,
    filePath: '/uploads/inventory_q2.xlsx',
    headers: ['Product', 'Category', 'Stock', 'Price', 'Supplier'],
    rowCount: 75,
    columnCount: 5,
    status: 'processed',
    user: user1Id,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    fileName: 'marketing_campaign.xlsx',
    originalName: 'Marketing Campaign Results.xlsx',
    fileSize: 15432,
    filePath: '/uploads/marketing_campaign.xlsx',
    headers: ['Campaign', 'Channel', 'Spend', 'Clicks', 'Conversions', 'Revenue'],
    rowCount: 200,
    columnCount: 6,
    status: 'processed',
    user: user2Id,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  }
]);

// Add sample charts
print('Adding sample charts...');
const upload1Id = db.uploads.findOne({ fileName: 'sales_data_2023.xlsx' })._id;
const upload2Id = db.uploads.findOne({ fileName: 'inventory_q2.xlsx' })._id;
const upload3Id = db.uploads.findOne({ fileName: 'marketing_campaign.xlsx' })._id;

db.charts.insertMany([
  {
    title: 'Sales by Region',
    description: 'Bar chart showing sales performance by region',
    type: 'bar',
    xAxis: 'Region',
    yAxis: 'Sales',
    configuration: {
      colors: ['#4e79a7', '#f28e2c', '#e15759'],
      showLegend: true,
      showGrid: true
    },
    isPublic: true,
    tags: ['sales', 'region', 'performance'],
    downloadCount: 12,
    upload: upload1Id,
    user: user1Id,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
  },
  {
    title: 'Profit Trends',
    description: 'Line chart showing profit trends over time',
    type: 'line',
    xAxis: 'Date',
    yAxis: 'Profit',
    configuration: {
      colors: ['#59a14f'],
      showLegend: false,
      showGrid: true,
      showTrendline: true
    },
    isPublic: false,
    tags: ['profit', 'trends', 'time-series'],
    downloadCount: 5,
    upload: upload1Id,
    user: user1Id,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    title: 'Stock Distribution by Category',
    description: 'Pie chart showing inventory distribution across categories',
    type: 'pie',
    xAxis: 'Category',
    yAxis: 'Stock',
    configuration: {
      colors: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f'],
      showLegend: true,
      showLabels: true
    },
    isPublic: true,
    tags: ['inventory', 'stock', 'category'],
    downloadCount: 8,
    upload: upload2Id,
    user: user1Id,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    title: 'Marketing ROI by Channel',
    description: 'Bar chart comparing marketing ROI across different channels',
    type: 'bar',
    xAxis: 'Channel',
    yAxis: 'Revenue',
    configuration: {
      colors: ['#b07aa1', '#ff9da7', '#9c755f', '#bab0ab'],
      showLegend: true,
      showGrid: true,
      stacked: false
    },
    isPublic: true,
    tags: ['marketing', 'ROI', 'channels'],
    downloadCount: 15,
    upload: upload3Id,
    user: user2Id,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  }
]);

print('MongoDB initialization completed successfully!');
print('Sample data has been added to the excel_analytics database.');
print('You can now run the application with MongoDB support.'); 