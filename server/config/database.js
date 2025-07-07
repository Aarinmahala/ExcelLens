const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');

const connectDB = async (retryCount = 0, maxRetries = 5, delay = 2000) => {
  try {
    logger.info(`🔌 Connecting to MongoDB (attempt ${retryCount + 1}/${maxRetries})...`);
    
    // Remove deprecated options
    const mongoURI = config.database.uri;
    const options = {
      serverSelectionTimeoutMS: 5000
    };
    
    await mongoose.connect(mongoURI, options);
    
    logger.success('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    
    if (retryCount < maxRetries - 1) {
      const nextDelay = delay * 2;
      logger.info(`⏳ Retrying in ${delay / 1000} seconds...`);
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(connectDB(retryCount + 1, maxRetries, nextDelay));
        }, delay);
      });
    } else {
      logger.error(`❌ Failed to connect to MongoDB after ${maxRetries} attempts`);
      
      // Return false but don't throw error - let the app run in mock mode
      return false;
    }
  }
};

// Add a fallback mechanism to check if MongoDB is running
const isMockMode = () => {
  return !mongoose.connection || mongoose.connection.readyState !== 1;
};

module.exports = {
  connectDB,
  isMockMode
}; 