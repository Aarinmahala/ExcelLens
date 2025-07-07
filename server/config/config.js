database: {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/excel_analytics',
  options: {
    serverSelectionTimeoutMS: 5000
  },
  mockMode: {
    enabled: process.env.MOCK_MODE === 'true' || false
  }
} 