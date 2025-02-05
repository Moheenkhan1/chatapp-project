import React, { useState, useEffect, useRef } from "react";
import { FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StarBorder from "../components/StarBorderButton";

const Sidebar = ({ setSelectedContact, currentUser, setCurrentUser }) => {
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); 

  const navigate = useNavigate();
  const settingsRef = useRef(null); 
  const settingsIconRef = useRef(null); 

  // Close settings if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only close if clicked outside the settings sidebar and icon
      if (settingsOpen && settingsRef.current && !settingsRef.current.contains(e.target) && !settingsIconRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [settingsOpen]);

  // Fetch contacts when currentUser is available
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        try {
          const response = await axios.get("http://localhost:5000/home/contacts", {
            withCredentials: true,
          });
          setContacts(response.data.contacts);
        } catch (error) {
          console.error("Error fetching contacts:", error.response?.data || error.message);
        }
      }
    };
    fetchContacts();
  }, [currentUser]);

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSettings = (e) => {
    e.stopPropagation(); // Prevent triggering the outside click event
    setSettingsOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:5000/user/logout", {}, { withCredentials: true });

      if (response.status === 200) {
        localStorage.removeItem("user");
        setCurrentUser(null);
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setSelectedContactId(contact._id);
  };

  const handlePhotoClick = (photoUrl, e) => {
    e.stopPropagation(); // Prevents triggering the parent click event
    setSelectedPhoto(photoUrl);
    setIsPhotoOpen(true);
  };

  return (
    <div className="relative w-1/4 bg-black p-5 shadow-md text-white overflow-auto">
      <h2 className="text-lg text-cyan-400 font-bold mb-4">Chats</h2>
      

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search chats..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-900 text-cyan-400 border border-gray-700 rounded-lg placeholder-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />

      {/* Contacts List */}
      <ul>
        {filteredContacts.map((contact) => (
          <li
            key={contact._id}
            className={`flex items-center space-x-4 mb-2 p-3 rounded-lg cursor-pointer transition-colors duration-300 ${
              selectedContactId === contact._id
                ? "bg-cyan-500 text-white"
                : "bg-black hover:bg-gray-900 hover:text-cyan-400"
            }`}
            onClick={() => handleContactClick(contact)}
          >
            <img
              className="w-[4rem] h-[4rem] rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
              src={`http://localhost:5000${contact.avatar.fileUrl}`}
              alt="profile"
              onClick={(e) => handlePhotoClick(`http://localhost:5000${contact.avatar.fileUrl}`, e)}
            />
            <p className="text-xl">{contact.username}</p>
          </li>
        ))}
      </ul>

      {/* Settings Icon */}
      <div
        ref={settingsIconRef} // Attach the ref to the settings icon
        className="absolute bottom-5 left-5 text-cyan-400 cursor-pointer"
        onClick={toggleSettings}
      >
        <FaCog size={30} />
      </div>

      {/* Settings Sidebar */}
      {settingsOpen && currentUser && (
        <div
          ref={settingsRef} // Attach the ref to this div
          className="absolute bottom-0 left-0 w-full p-6 shadow-2xl rounded-tl-lg transition-transform duration-700 ease-out transform bg-gray-800 opacity-100"
        >
          <h3 className="text-lg text-cyan-400 font-bold mb-4">{currentUser.username}</h3>
          <StarBorder as="button" className="w-full mb-4" color="cyan" speed="5s">
            Change Password
          </StarBorder>
          <StarBorder as="button" className="w-full" color="red" speed="5s" onClick={handleLogout}>
            Logout
          </StarBorder>
        </div>
      )}

      {/* Enlarged Profile Photo Modal */}
      {isPhotoOpen && selectedPhoto && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
          onClick={() => setIsPhotoOpen(false)}
        >
          <div className="relative bg-transparent p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 bg-cyan-400 text-white p-2 rounded-full hover:bg-blue-800"
              onClick={() => setIsPhotoOpen(false)}
            >
              ✖
            </button>
            <img
              src={selectedPhoto}
              alt="Enlarged Profile"
              className="w-96 h-96 rounded-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
