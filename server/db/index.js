const mongoose = require('mongoose');
const { config } = require('../config');

/**
 * MongoDB connection module
 * Handles database connection and provides helper functions
 */

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;

/**
 * Connect to MongoDB
 * @returns {Promise<boolean>} - True if connected successfully, false otherwise
 */
const connectDB = async () => {
  try {
    // If already connected, return true
    if (isConnected) {
      console.log('🔄 MongoDB connection already established');
      return true;
    }

    // Increment connection attempts
    connectionAttempts++;
    console.log(`🔌 Connecting to MongoDB (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS})...`);

    // Connect to MongoDB with a timeout
    await mongoose.connect(config.database.uri, {
      ...config.database.options,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    });
    
    // Set connection state
    isConnected = true;
    connectionAttempts = 0;
    
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // If max retry attempts reached, throw error to be handled by server.js
    if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
      connectionAttempts = 0; // Reset for next attempt
      throw new Error(`Failed to connect to MongoDB after ${MAX_RETRY_ATTEMPTS} attempts`);
    }
    
    // Wait before retrying
    const retryDelay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
    console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
    
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    return connectDB();
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  if (!isConnected) {
    console.log('⚠️ No MongoDB connection to close');
    return;
  }
  
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
  }
};

/**
 * Check if connected to MongoDB
 * @returns {boolean}
 */
const isConnectedToDB = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get connection status information
 * @returns {Object} - Connection status information
 */
const getConnectionStatus = () => {
  return {
    isConnected: isConnectedToDB(),
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.models)
  };
};

// Export the module
module.exports = {
  connectDB,
  disconnectDB,
  isConnectedToDB,
  getConnectionStatus
}; 