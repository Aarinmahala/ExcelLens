/**
 * MongoDB Connection Check Script
 * 
 * This script checks the connection to MongoDB and displays the status.
 * Run this script with: node scripts/check-mongodb.js
 */

const mongoose = require('mongoose');
const { config } = require('../config');
const { connectDB, disconnectDB, getConnectionStatus } = require('../db');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Check MongoDB connection and display status
 */
const checkMongoDBConnection = async () => {
  console.log(`${colors.cyan}=== MongoDB Connection Check ===${colors.reset}`);
  console.log(`${colors.blue}Connection URI:${colors.reset} ${config.database.uri}`);
  
  try {
    console.log(`${colors.yellow}Attempting to connect to MongoDB...${colors.reset}`);
    const connected = await connectDB();
    
    if (connected) {
      console.log(`${colors.green}✅ Successfully connected to MongoDB!${colors.reset}`);
      
      // Get connection status
      const status = getConnectionStatus();
      
      console.log(`\n${colors.cyan}Connection Details:${colors.reset}`);
      console.log(`${colors.blue}Host:${colors.reset} ${status.host || 'localhost:27017'}`);
      console.log(`${colors.blue}Database:${colors.reset} ${status.name || 'excel_analytics'}`);
      console.log(`${colors.blue}Status:${colors.reset} ${status.isConnected ? 'Connected' : 'Disconnected'}`);
      console.log(`${colors.blue}Ready State:${colors.reset} ${status.readyState}`);
      
      // List available models
      console.log(`\n${colors.cyan}Available Models:${colors.reset}`);
      if (status.models && status.models.length > 0) {
        status.models.forEach(model => {
          console.log(`${colors.green}- ${model}${colors.reset}`);
        });
      } else {
        console.log(`${colors.yellow}No models available${colors.reset}`);
      }
      
      // List available collections
      try {
        console.log(`\n${colors.cyan}Available Collections:${colors.reset}`);
        const collections = await mongoose.connection.db.listCollections().toArray();
        if (collections.length > 0) {
          collections.forEach(collection => {
            console.log(`${colors.green}- ${collection.name}${colors.reset}`);
          });
        } else {
          console.log(`${colors.yellow}No collections available${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.red}Error listing collections: ${error.message}${colors.reset}`);
      }
      
    } else {
      console.log(`${colors.red}❌ Failed to connect to MongoDB${colors.reset}`);
      console.log(`${colors.yellow}Please check if MongoDB is running and the connection URI is correct.${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error connecting to MongoDB: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Please check if MongoDB is running and the connection URI is correct.${colors.reset}`);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

// Run the check
checkMongoDBConnection(); 