import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserContext from './Contexts/UserContext';
import { OnlineUsersProvider } from './Contexts/OnlineUsersContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <OnlineUsersProvider>
      <UserContext>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>

        <ToastContainer/>
      </UserContext>
    </OnlineUsersProvider>
  );
}

export default App;
