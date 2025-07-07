# Excel Analytics Platform

A full-stack MERN application that allows users to upload Excel files, visualize data with interactive charts, and download charts in various formats.

## Features

- **User Authentication**: Secure login system with JWT
- **Excel File Upload**: Upload .xls or .xlsx files
- **Data Visualization**: Create interactive 2D/3D charts
- **Chart Export**: Download charts as PNG or PDF
- **User Dashboard**: Track uploads, visualizations, and activities
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, the app can run in mock mode without it)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd excel-analytics-platform
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. MongoDB Setup:
   - Install MongoDB from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Start MongoDB service on your local machine
   - The default connection string is `mongodb://localhost:27017/excel_analytics`
   - For detailed setup instructions, see [MongoDB Setup Guide](MONGODB_SETUP_GUIDE.md)
   - To check MongoDB connection:
     ```
     cd server
     node scripts/check-mongodb.js
     ```
   - To initialize the database with sample data:
     ```
     cd server
     node scripts/init-db.js
     ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Login Credentials

When running with initialized MongoDB database:

- **Regular User**:
  - Email: user@example.com
  - Password: user123

- **Admin User**:
  - Email: admin@example.com
  - Password: admin123

## Usage Guide

1. **Login**: Use the provided credentials to log in
2. **Upload Excel**: Click the "Upload Excel" button on the dashboard
3. **Create Charts**: Select an uploaded file and choose chart type and data columns
4. **View & Download**: View your charts and download them as PNG or PDF
5. **Track History**: View your upload and chart creation history

## Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, Chart.js, Three.js
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT
- **File Handling**: Multer, SheetJS (xlsx)

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend API
- `/server/uploads` - Uploaded Excel files storage
- `/server/models` - MongoDB data models
- `/server/scripts` - Database utility scripts

## Development Notes

- The application can run in two modes:
  - **MongoDB Mode**: Full functionality with database persistence
  - **Mock Mode**: Fallback mode when MongoDB is not available

### Application Modes

#### MongoDB Mode
- Complete functionality with data persistence
- User authentication and authorization
- File upload history and chart storage
- User activity tracking

#### Mock Mode
- Automatically activated when MongoDB connection fails
- Uses in-memory data structures
- Limited persistence (data is lost on server restart)
- Useful for quick testing and development

### API Configuration

All API endpoints are centralized in configuration files:
- Server: `server/config/config.json`
- Client: `client/src/config/api.config.ts`

To modify API endpoints, update these files to ensure consistency between client and server.

### Security Features

The application includes several security features:
- JWT authentication with configurable expiration
- Rate limiting to prevent abuse
- Helmet for HTTP header security
- CORS configuration for controlled access
- MongoDB connection retry with exponential backoff

## MongoDB Tools

The project includes several MongoDB utility scripts:

- `server/scripts/check-mongodb.js` - Check MongoDB connection status
- `server/scripts/init-db.js` - Initialize database with sample data

## License

MIT 