# Chat Application

This is a real-time chat application with user authentication, messaging, file sharing with online offline status .

## 🚀 Quick Start

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd chatapp-project-main
   ```
2. Install dependencies for both frontend and backend:
   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. Set up environment variables (see `.env.example` in backend and frontend).
4. Start the backend server:
   ```sh
   cd backend
   nodemon app.js
   ```
5. Start the frontend application:
   ```sh
   cd frontend
   npm run dev 
   ```
6. Open the app in the browser at your specified `http://localhost:${PORT}`.

## 📂 Project Structure

```
chatapp-project-main/
│── backend/               # Server-side code (Node.js, Express, MongoDB)
│   ├── app.js             # Main server file
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── models/            # Database models
│   ├── config/            # Configuration files
│   ├── middleware/        # Authentication and other middleware
│   ├── utils/             # Helper functions
│   ├── .env.example       # Environment variables example
│   ├── package.json       # Backend dependencies
│── frontend/              # Client-side code (React, Tailwind CSS)
│   ├── src/
│   │   ├── pages/         # Main pages (Home, Login, Register)
│   │   ├── components/    # Reusable components (Sidebar, MainChat)
│   │   ├── context/       # Global state management
│   │   ├── utils/         # Helper functions
│   ├── public/            # Static assets
│   ├── .env.example       # Environment variables example
│   ├── package.json       # Frontend dependencies
│── README.md              # Project documentation
```

## 🛠 Features

- 🔐 User authentication (login, register)
- 💬 Real-time messaging (WebSockets)
- 📎 File sharing (images, videos, audio, etc.)
- 🌐 Online/offline user status
- 🎭 Emojis and reactions support
- 📁 Chat history persistence

## 🏗 Setup Instructions

1. **Backend Configuration**:
   - Create a `.env` file in the `backend/` directory (refer to `.env.example`).
   - Run migrations if using a database schema.

2. **Frontend Configuration**:
   - Create a `.env` file in the `frontend/` directory (refer to `.env.example`).
   - Update the API base URL.

3. **Start Development Servers**:
   ```sh
   cd backend
   npm start

   cd ../frontend
   npm start
   ```

## 🛡 Authentication

- Uses JWT-based authentication for secure API requests.
- Authentication middleware in `backend/middleware/auth.js`.

## 📡 WebSocket Implementation

- Uses `socket.io` for real-time messaging.
- Implemented in `backend/socket.js`.

## 🛠 API Endpoints

- `POST /user/auth/register` - Register a new user.
- `POST /user/auth/login` - User login.
- `POST /user/auth/logout` - User logout.
- `GET /messages/getMessages/:sender/:receiver` - Fetch chat messages.
- `POST /messages/addMessages` - Send a new message.
- `POST /messages/deleteMessage/:messageId/:userId` - delete a  message.
_(See `backend/routes/` for more details.)_

## 📸 Media and File Sharing

- Supports image, video, and audio file uploads.
- Uses `multer` for file handling.
- Uses `Cloudinary` for cloud file storage

## 🗃 Database

- MongoDB is used as the primary database.
- Mongoose is used for schema and model management.

