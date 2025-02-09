import React, { useState, useEffect, useRef, useContext } from "react";
import { FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTimes } from 'react-icons/fa';
import { useOnlineUsers } from '../Contexts/OnlineUsersContext';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { UserDataContext } from '../Contexts/UserContext'

const Sidebar = ({ setSelectedContact, currentUser, setCurrentUser , socket , setShowChat , showChat }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Access env variable


  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const { user , setUser } = useContext(UserDataContext)

  const { onlineUsers } = useOnlineUsers(useOnlineUsers);

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
          const response = await axios.get(`${API_BASE_URL}/home/contacts`, {
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
      const response = await axios.post(`${API_BASE_URL}/user/logout`, {}, { withCredentials: true });

      if (response.status === 200) {
        setUser(null);
        setCurrentUser(null);
        toast.success('Logged Out Successfully.!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          });
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setSelectedContactId(contact._id);

    setShowChat(true); // Hide sidebar on mobile
  };

  const handlePhotoClick = (photoUrl, e) => {
    e.stopPropagation(); // Prevents triggering the parent click event
    setSelectedPhoto(photoUrl);
    setIsPhotoOpen(true);
  };

  return (
    <div className={`relative w-1/4 max-md:w-full max-sm:w-full max-lg:w-full max-xl:w-full max-[768px]:w-full max-[1024px]:w-full max-[912px]:w-full max-[853px]:w-full bg-white p-5 shadow-md text-white overflow-auto ${showChat ? "max-md:hidden max-sm:hidden max-lg:hidden max-xl:hidden max-[768px]:hidden max-[1024px]:hidden max-[912px]:hidden max-[853px]:hidden" : "max-md:flex max-md:flex-col max-sm:flex max-sm:flex-col max-lg:flex max-lg:flex-col max-xl:flex max-xl:flex-col max-[768px]:flex max-[768px]:flex-col max-[1024px]:flex max-[1024px]:flex-col max-[912px]:flex max-[912px]:flex-col max-[853px]:flex max-[853px]:flex-col"}`}>

<div className="fixed top-0 left-0 w-1/4 max-md:w-full bg-white p-5 shadow-md z-10">
      <h2 className="text-[1.7rem] text-[#4169E1] font-extrabold mb-4">Chats</h2>
      <input
        type="text"
        placeholder="Search chats..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 bg-[#E8E8E8] text-black border border-gray-700 rounded-lg placeholder-black focus:outline-none focus:ring focus:ring-indigo-500"
      />
    </div>

      {/* Contacts List */}
      <ul className="mt-[1/4] max-sm:mt-[40%] overflow-auto">
        {filteredContacts.map((contact) => (
          <li
            key={contact._id}
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 ${
              selectedContactId === contact._id
                ? "bg-[#385AC2] text-white"
                : "bg-[#E8E8E8] text-black hover:bg-white hover:text-[#385AC2]"
            }`}
            onClick={() => handleContactClick(contact)}
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src={contact.profilePicture}
                alt="profile"
                onClick={(e) => handlePhotoClick(contact.profilePicture, e)}
              />
              {/* Online Status Indicator */}
              {onlineUsers.some(user => user._id === contact._id && user.isOnline) && (
                <div className="w-5 h-5 rounded-full bg-green-500 absolute bottom-0 right-0 transform translate-x-1 translate-y-1"></div>
              )}
            </div>
            <p className="text-xl">{contact.username}</p>
          </li>
        ))}
      </ul>

      {/* Settings Icon */}
      <div
        ref={settingsIconRef} // Attach the ref to the settings icon
        className="fixed bottom-5 left-5 text-[#385AC2] cursor-pointer"
        onClick={toggleSettings}
      >
        <FaCog size={30} />
      </div>

      {/* Settings Sidebar */}
      {settingsOpen && currentUser && (
        <div
          ref={settingsRef} // Attach the ref to this div
          className="fixed bottom-0 w-[24%] left-0 p-6 rounded-tl-lg transition-transform duration-700 ease-out transform bg-[#E8E8E8] opacity-100 shadow-[60px_0_55px_45px_rgba(0,0,0,0.25)] max-md:w-[100%] max-lg:w-[100%]"
        >
          {/* <h3 className="text-lg text-cyan-400 font-bold mb-4">{currentUser.username}</h3> */}
          <div className="flex items-center space-x-4">
            <img
              className="w-12 h-12 rounded-full object-cover ring"
              src={currentUser.profilePicture}
              alt="Profile"
            />
            <h3 className="text-xl text-[#385AC2] font-bold">{currentUser.username}</h3>
          </div>
              <button
                className="custom-class w-[40%] shadow-lg shadow-indigo-500/50 mt-6 p-[10px] rounded-[10px] text-[white] text-[1.2rem] bg-[royalblue] hover:bg-[red]"
                onClick={handleLogout}
              >
                Logout
              </button>
        </div>
      )}

      {/* Photo View */}
      {isPhotoOpen && selectedPhoto && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
          onClick={() => setIsPhotoOpen(false)}
        >
          <div className="relative bg-transparent p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 bg-[#385AC2] text-white p-2 rounded-full hover:bg-blue-800"
              onClick={() => setIsPhotoOpen(false)}
            >
              <FaTimes className="text-white" /> {/* Icon here */}
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
