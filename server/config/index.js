const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Load configuration from JSON file
const configPath = path.join(__dirname, 'config.json');
const configJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Override with environment variables if provided
const config = {
  server: {
    port: process.env.PORT || configJson.server.port,
    environment: process.env.NODE_ENV || configJson.server.environment,
    corsOrigin: process.env.CLIENT_URL || configJson.server.corsOrigin,
    jwtSecret: process.env.JWT_SECRET || configJson.server.jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || configJson.server.jwtExpiresIn
  },
  database: {
    uri: process.env.MONGODB_URI || configJson.database.uri,
    options: configJson.database.options
  },
  api: configJson.api,
  uploads: {
    path: process.env.UPLOAD_PATH || configJson.uploads.path,
    maxSize: configJson.uploads.maxSize,
    allowedTypes: configJson.uploads.allowedTypes
  },
  security: configJson.security
};

// Helper function to get API endpoint paths
const getEndpointPath = (service, endpoint) => {
  const apiConfig = config.api;
  const serviceConfig = apiConfig.endpoints[service];
  
  if (!serviceConfig) {
    throw new Error(`Service "${service}" not found in API configuration`);
  }
  
  if (endpoint === 'base') {
    return `${apiConfig.prefix}${serviceConfig.base}`;
  }
  
  if (!serviceConfig[endpoint]) {
    throw new Error(`Endpoint "${endpoint}" not found in "${service}" service configuration`);
  }
  
  return `${apiConfig.prefix}${serviceConfig.base}${serviceConfig[endpoint]}`;
};

// Helper function to build a full API URL
const getApiUrl = (service, endpoint) => {
  const protocol = config.server.environment === 'production' ? 'https' : 'http';
  const host = config.server.environment === 'production' ? 
    process.env.PRODUCTION_HOST || 'localhost' : 
    'localhost';
  const port = config.server.port;
  
  return `${protocol}://${host}:${port}${getEndpointPath(service, endpoint)}`;
};

module.exports = {
  config,
  getEndpointPath,
  getApiUrl
}; 