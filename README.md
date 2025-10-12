 
 # RateIt - Store Rating Application

A full-stack application for rating stores with role-based authentication system built with React.js frontend and Node.js backend with SQLite database.

## 🚀 Features

- **Professional Login System** with role-based authentication
- **Multiple User Roles**: Normal User, Store Owner, System Administrator
- **Responsive Design** that works on all devices
- **Real-time Form Validation**
- **Store Management** - Browse, rate, and review stores
- **Rating System** - 1-5 star ratings with comments
- **JWT Authentication** - Secure token-based authentication

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **CSS3** - Styling and responsive design
- **Lucide React** - Modern icons
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication# RateIt - Store Rating Application

A full-stack application for rating stores with role-based authentication system built with React.js frontend and Node.js backend with SQLite database.

## 🚀 Features

- **Professional Login System** with role-based authentication
- **Multiple User Roles**: Normal User, Store Owner, System Administrator
- **Responsive Design** that works on all devices
- **Real-time Form Validation**
- **Store Management** - Browse, rate, and review stores
- **Rating System** - 1-5 star ratings with comments
- **JWT Authentication** - Secure token-based authentication

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **CSS3** - Styling and responsive design
- **Lucide React** - Modern icons
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📁 Project Structure
RateIt/
├── frontend/ # React.js frontend application
│ ├── src/
│ │ ├── components/
│ │ │ └── LoginForm.js # Professional login component
│ │ ├── App.js # Main application component
│ │ ├── App.css # Application styles
│ │ └── index.js # Entry point
│ ├── public/
│ │ └── index.html # HTML template
│ └── package.json # Dependencies
├── backend/ # Node.js/Express backend
│ ├── src/
│ │ ├── routes/ # API routes
│ │ ├── models/ # Data models
│ │ ├── middleware/ # Custom middleware
│ │ └── server.js # Server entry point
│ ├── database.db # SQLite database
│ └── package.json # Dependencies
└── README.md # Project documentation

text

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nikhil166-tech/RateIt.git
   cd RateIt
Frontend Setup
Navigate to frontend directory

bash
cd frontend
Install dependencies

bash
npm install
Environment Configuration
Create .env file in frontend directory:

env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=RateIt
Start development server

bash
npm start
Frontend will run on http://localhost:3000

Backend Setup
Navigate to backend directory

bash
cd backend
Install dependencies

bash
npm install
Environment Configuration
Create .env file in backend directory:

env
PORT=5000
DB_PATH=./database.db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
Start development server

bash
npm run dev
Backend will run on http://localhost:5000

🔐 Authentication & Demo Credentials
The application includes pre-configured demo accounts:

Role	Email	Password	Access
👤 Normal User	user@storerater.com	User123!	Browse and rate stores
🏪 Store Owner	owner@storerater.com	Owner123!	Manage stores and view analytics
⚙️ System Administrator	admin@storerater.com	Admin123!	Full system access
📡 API Documentation
Base URL
text
http://localhost:5000/api
Authentication Endpoints
Login
POST /auth/login

json
{
  "email": "user@storerater.com",
  "password": "User123!",
  "role": "Normal User"
}
Response:

json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@storerater.com",
    "role": "Normal User",
    "name": "John Doe"
  }
}
Register
POST /auth/register

json
{
  "name": "John Doe",
  "email": "new@storerater.com",
  "password": "NewPass123!",
  "role": "Normal User"
}
Store Endpoints
Get All Stores
GET /stores

Headers: Authorization: Bearer <token>

Create Store
POST /stores (Store Owners only)

json
{
  "name": "Store Name",
  "description": "Description",
  "location": "Address",
  "category": "Retail"
}
Rating Endpoints
Submit Rating
POST /stores/:id/ratings

json
{
  "rating": 5,
  "comment": "Excellent service!",
  "visitDate": "2024-01-15"
}
🗄️ Database Schema
Users Table
sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
Stores Table
sql
CREATE TABLE stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    category TEXT,
    owner_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
Ratings Table
sql
CREATE TABLE ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER,
    user_id INTEGER,
    rating INTEGER NOT NULL,
    comment TEXT,
    visit_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
🚀 Deployment
Frontend Deployment (Vercel/Netlify)
Build the project

bash
cd frontend
npm run build
Deploy to your preferred platform

Backend Deployment (Railway/Render)
Set environment variables

env
PORT=5000
JWT_SECRET=your_production_secret
NODE_ENV=production
🤝 Contributing
Fork the repository

Create a feature branch

Commit your changes

Push to the branch

Open a Pull Request

📄 License
This project is licensed under the MIT License.

👨‍💻 Author
Nikhil ItharajU

GitHub: @Nikhil166-tech

<div align="center">
If you like this project, don't forget to give it a ⭐!

</div> ```
- **bcrypt** - Password hashing

## 📁 Project Structure
