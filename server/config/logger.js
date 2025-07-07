/**
 * Simple logger module for the Excel Analytics Platform
 */

const logger = {
  info: (message) => {
    console.log(message);
  },
  
  warn: (message) => {
    console.warn(message);
  },
  
  error: (message) => {
    console.error(message);
  },
  
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message);
    }
  }
};

module.exports = logger; 