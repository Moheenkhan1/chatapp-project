import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from "react-icons/fa"; // Social icons

const Settings = () => {
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    axios
      .get("http://localhost:8080/student/profile", { withCredentials: true })
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user data:", error));
  };

  const handleProfileChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const updateProfile = (e) => {
    e.preventDefault();
    axios
      .put("http://localhost:8080/student/profile", user, { withCredentials: true })
      .then(() => setMessage("Profile updated successfully!"))
      .catch(() => setMessage("Error updating profile."));
  };

  const changePassword = (e) => {
    e.preventDefault();
    axios
      .put("http://localhost:8080/student/change-password", passwords, { withCredentials: true })
      .then(() => setMessage("Password updated successfully!"))
      .catch(() => setMessage("Error changing password."));
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg fixed mb-5">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Settings & Security</h2>

        {message && <p className="text-center text-green-600 font-semibold">{message}</p>}

        {/* Profile Update Section */}
        <form onSubmit={updateProfile} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium">Full Name</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
              <FiUser className="text-gray-500 mr-2" />
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleProfileChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-200">
              <FiMail className="text-gray-500 mr-2" />
              <input
                type="email"
                name="email"
                value={user.email}
                disabled
                className="w-full bg-transparent outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Phone</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
              <FiPhone className="text-gray-500 mr-2" />
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleProfileChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Update Profile
          </button>
        </form>

        {/* Divider */}
        <hr className="my-6 border-gray-300" />

        {/* Change Password Section */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Current Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-red-500">
              <FiLock className="text-gray-500 mr-2" />
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">New Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-red-500">
              <FiLock className="text-gray-500 mr-2" />
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
          >
            Change Password
          </button>
        </form>
      </div>
      {/* Footer */}
                  <footer className="w-full text-blue-600 py-4 mt-auto fixed bottom-0">
                    <div className="flex justify-center space-x-6">
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition">
                        <FaInstagram size={24} />
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition">
                        <FaTwitter size={24} />
                      </a>
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition">
                        <FaFacebook size={24} />
                      </a>
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition">
                        <FaYoutube size={24} />
                      </a>
                    </div>
                  </footer>
    </div>
  );
};

export default Settings;