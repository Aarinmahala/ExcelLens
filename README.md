# ExcelLens - Excel Analytics Platform

A full-stack MERN application for Excel file analytics and visualization.

## Features

- **User Authentication**: Secure login/registration with JWT
- **Excel File Upload**: Upload, parse, and analyze Excel files
  - Drag and drop interface
  - File validation
  - Progress tracking
  - Data preview
- **Data Visualization**: Create interactive charts from Excel data
  - Multiple chart types (Bar, Line, Pie, Area, Scatter)
  - Customizable chart options
  - Download charts as PNG/PDF
- **Dashboard**: Overview of analytics and recent activity
- **Account Management**: Complete user profile and settings
  - Update profile information
  - Change password
  - Notification preferences
  - Account deletion
- **History Tracking**: View past uploads and visualizations

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Chart.js for data visualization
- Lucide React for icons

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer for file uploads
- SheetJS for Excel parsing

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
```bash
git clone [https://github.com/Aarinmahala/ExcelLens.git]
cd ExcelLens
```

2. Install dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development server
```bash
# From the root directory
npm start
```

## Usage

1. Register a new account or login
2. Upload an Excel file from the Upload page
3. View the parsed data and create visualizations
4. Save and share your charts
5. Manage your account settings

## Project Structure

```
excellens/
├── client/                # React frontend
│   ├── public/            # Static files
│   └── src/               # Source files
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── services/      # API services
│       ├── store/         # Redux store
│       └── hooks/         # Custom hooks
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose models
│   └── routes/            # API routes
└── package.json           # Project dependencies
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
