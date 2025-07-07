# Excel Analytics Platform

A full-stack web application that allows users to upload Excel files (.xls or .xlsx), visualize the data with interactive 2D/3D charts, and download charts in PNG/PDF formats. The app includes user and admin roles with secure JWT authentication.

## Features

- **User & Admin Authentication (JWT)**
  - Secure login system with JSON Web Tokens
  - Role-based access: Admins can access additional dashboards

- **Excel Upload & Parsing**
  - File uploads using Multer
  - Excel data parsed to JSON using SheetJS (xlsx)

- **Dynamic Data Mapping**
  - Users choose X & Y axes from Excel headers
  - Interactive dropdowns for flexible chart creation

- **Chart Generation**
  - 2D Charts: Bar, Line, Pie, Scatter using Chart.js
  - 3D Charts: Using Three.js for immersive data views

- **Downloadable Charts**
  - Export charts as PNG (via Chart.js) or PDF (via html2canvas/jsPDF)

- **Upload History Dashboard**
  - Track previous uploads, visualizations, and actions
  - Admins can monitor user activities and stats

## Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Chart.js
- Three.js

### Backend
- Node.js
- Express.js
- MongoDB
- Multer (File upload)
- SheetJS (xlsx)

## Getting Started

Please refer to the [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) file for detailed setup instructions.

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/Aarinmahala/ExcelLens.git
cd ExcelLens
```

2. Start the application using one of these scripts:
   - **restart-app.bat** - Double-click this file to restart both server and client
   - **restart-app.ps1** - Right-click and "Run with PowerShell" to restart both server and client

## Login Credentials (Mock Mode)

- **User Account:**
  - Email: user@example.com
  - Password: password123

- **Admin Account:**
  - Email: admin@example.com
  - Password: password123 

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
