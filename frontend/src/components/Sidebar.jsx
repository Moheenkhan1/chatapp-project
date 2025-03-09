import React, { useState, useEffect, useRef, useContext } from "react";
import { FaCog  } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTimes } from 'react-icons/fa';
import { useOnlineUsers } from '../Contexts/OnlineUsersContext';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { UserDataContext } from '../Contexts/UserContext'
import AiChat from "./AiChat";
import { GiArtificialHive } from "react-icons/gi"

const Sidebar = ({ setSelectedContact, currentUser, setCurrentUser , socket , setShowChat , showChat , unreadCounts ,  setUnreadCounts ,selectedContactId,setSelectedContactId }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Access env variable


  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const { user , setUser } = useContext(UserDataContext)
  const [changePassbtn , setChangePassbtn] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

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

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/messages/unread`, {
          withCredentials: true,
        });
        
        // Convert array to object: { senderId: count }
        const unreadMap = response.data.reduce((acc, msg) => {
          acc[msg._id] = msg.count;
          return acc;
        }, {});
  
        setUnreadCounts(unreadMap);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };
  
    fetchUnreadMessages();
  }, [currentUser]); // Re-fetch when user changes
  

  useEffect(() => {
    if (socket.current) {
      socket.current.on("update-unread-count", ({ senderId, count }) => {
        console.log(`📩 Received Unread Update: Sender ${senderId} Count ${count}`);
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: count,
        }));
      });
    }
  
    return () => {
      if (socket.current) {
        socket.current.off("update-unread-count");
      }
    };
  }, [socket]);
  
  
  
  
  
  
  
  

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

  const markMessagesAsRead = async (contactId) => {
    try {
      await axios.post(`${API_BASE_URL}/messages/mark-as-read`, { senderId: contactId }, { withCredentials: true });
  
      // ✅ Remove unread count for this sender
      setUnreadCounts((prev) => ({
        ...prev,
        [contactId]: 0,
      }));
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };
  
  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setSelectedContactId(contact._id);
    markMessagesAsRead(contact._id);
    setShowChat(true);
    setShowAiChat(false)
  };
  
  const handlePhotoClick = (photoUrl, e) => {
    e.stopPropagation(); // Prevents triggering the parent click event
    setSelectedPhoto(photoUrl);
    setIsPhotoOpen(true);
  };

  const handleChangePasswordButton =() =>{
    setChangePassbtn(true)
    // alert(changePassbtn)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", { position: "top-center", autoClose: 3000 });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/user/change-password`, {
        currentPassword,
        newPassword,
      }, { withCredentials: true });

      if (response.status === 200) {
        toast.success("Password changed successfully!", { position: "top-center", autoClose: 3000 });
        setChangePassbtn(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error changing password", { position: "top-center", autoClose: 3000 });
    }
  };


  // Handle file selection
const handleFileChange = (event) => {
  setSelectedFile(event.target.files[0]);
};


// Handle profile update
  const handleProfileChange = async () => {
    if (!selectedFile) {
      toast.error("Please select a file!", { position: "top-center" });
      return;
    }
  
    const formData = new FormData();
    formData.append("profilePicture", selectedFile);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/user/updateProfile`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.status === 200) {
        toast.success("Profile updated successfully!", { position: "top-center" });
  
        // Update user state with new profile picture
        setCurrentUser((prevUser) => ({
          ...prevUser,
          profilePicture: response.data.profilePicture, // Ensure backend returns the updated URL
        }));

        setShowFileInput(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile", {
        position: "top-center",
      });
    }
  };

  return (
    <div className={`relative w-1/4 max-md:w-full max-sm:w-full max-lg:w-full max-xl:w-full max-[768px]:w-full max-[1024px]:w-full max-[912px]:w-full max-[853px]:w-full bg-white p-5 shadow-md text-white overflow-auto ${showChat ? "max-md:hidden max-sm:hidden max-lg:hidden max-xl:hidden max-[768px]:hidden max-[1024px]:hidden max-[912px]:hidden max-[853px]:hidden" : "max-md:flex max-md:flex-col max-sm:flex max-sm:flex-col max-lg:flex max-lg:flex-col max-xl:flex max-xl:flex-col max-[768px]:flex max-[768px]:flex-col max-[1024px]:flex max-[1024px]:flex-col max-[912px]:flex max-[912px]:flex-col max-[853px]:flex max-[853px]:flex-col"}`}>
<div className="fixed top-0 left-0 lg:w-1/4 max-lg:w-full max-sm:w-full md:w-full bg-white p-5 shadow-md z-10">
  <div className="flex justify-between items-center">
    <h2 className="text-[1.7rem] text-[#4169E1] font-extrabold">Chats</h2>
    <button
      onClick={() =>
        setShowAiChat(true)
        } 
      className="flex items-center px-3 py-1 rounded-full shadow-lg"
    >
      <GiArtificialHive className="text-3xl text-blue-500"/>
    </button>

  </div>

  <input
    type="text"
    placeholder="Search chats..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full p-2 bg-[#E8E8E8] text-black border border-gray-700 rounded-lg placeholder-black focus:outline-none focus:ring focus:ring-indigo-500 mt-3"
  />

  {showAiChat && <AiChat closeChat={() => setShowAiChat(false)} />}
</div>


      {/* Contacts List */}
      <ul className="lg:mt-[30%] max-sm:mt-[40%] md:mt-[17%] max-lg:mt-[17%] overflow-auto">
        {filteredContacts.map((contact) => (
          <li
            key={contact._id}
            className={`flex items-center space-x-4 mb-1 shadow-md p-3 cursor-pointer transition-colors duration-300 ${
              selectedContactId === contact._id
                ? "bg-[#385AC2] text-white"
                : "bg-[#E8E8E8] text-black hover:bg-white hover:text-[#385AC2]"
            }`}
            onClick={() => handleContactClick(contact)}
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src={contact.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt="profile"
                onClick={(e) => handlePhotoClick(contact.profilePicture, e)}
              />
              {/* Online Status Indicator */}
              {onlineUsers.some(user => user._id === contact._id && user.isOnline) && (
                <div className="w-5 h-5 rounded-full bg-green-500 absolute bottom-0 right-0 transform translate-x-1 translate-y-1"></div>
              )}
            </div>
            <p className="text-xl">{contact.username}</p>

            {unreadCounts[contact._id] > 0 && (
  <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
    {unreadCounts[contact._id]}
  </span>
)}

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
              src={currentUser.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt="Profile"
            />
            <h3 className="text-xl text-[#385AC2] font-bold">{currentUser.username}</h3>
            

            <button
                className="custom-class w-[40%] shadow-lg shadow-indigo-500/50 mt-3 p-[10px] rounded-[10px] text-[white] text-[1rem] bg-[#385AC2]"
                onClick={() => setShowFileInput(true)}
              >
                Update Profile
              </button>
              {showFileInput && (
    <div className="fixed inset-0 text-black flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <button className=" text-[#385AC2]" onClick={() => setShowFileInput(false)}>
        <FaTimes size={20} />
      </button>
      
      <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    className=""
    id="profileInput"
  />
  {/* <label
    htmlFor="profileInput"
    className="custom-class w-[30%] shadow-lg shadow-indigo-500/50 mt-3 p-[10px] rounded-[10px] text-[white] text-[1rem] bg-[#385AC2] cursor-pointer"
  >
    Select File
  </label> */}

  <button
    className="custom-class w-[30%] shadow-lg shadow-indigo-500/50 mt-3 p-[10px] rounded-[10px] text-[white] text-[1rem] bg-[#385AC2]"
    onClick={handleProfileChange}
  >
    Save Profile
  </button>
  </div>
  </div>
  )}
          </div>
          <div className="flex flex-col" >
          <button
                className="custom-class w-[50%] shadow-lg shadow-indigo-500/50 mt-6 p-[10px] rounded-[10px] text-[white] text-[1.2rem] bg-[royalblue] hover:bg-[#385AC2]"
                onClick={handleChangePasswordButton}
              >
                Change Password
              </button>
              <button
                className="custom-class w-[50%] shadow-lg shadow-indigo-500/50 mt-6 p-[10px] rounded-[10px] text-[white] text-[1.2rem] bg-[red] hover:bg-red-800"
                onClick={handleLogout}
              >
                Logout
              </button>
              </div>
        </div>
      )}
      
      {changePassbtn && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <button className=" text-[#385AC2]" onClick={() => setChangePassbtn(false)}>
              <FaTimes size={20} />
            </button>
            <h2 className=" text-xl text-[#385AC2] font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <input type="password" placeholder="Current Password" className="w-full p-2 mb-2 border text-black  " value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              <input type="password" placeholder="New Password" className="w-full p-2 mb-2 border text-black" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <input type="password" placeholder="Confirm Password" className="w-full p-2 mb-2 border text-black" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="submit" className="bg-blue-500 text-white p-2 rounded w-[50%]">Submit</button>
            </form>
          </div>
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
