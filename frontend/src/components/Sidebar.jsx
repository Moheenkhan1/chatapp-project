import React, { useState , useEffect, useContext } from "react";
import { FaCog } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StarBorder from '../components/StarBorderButton';
import { UserDataContext } from '../Contexts/UserContext';

const Sidebar = ({ setSelectedContact , currentUser , setCurrentUser }) => {
  const [search, setSearch] = useState(""); 
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contacts, setContacts] = useState([])
  const [selectedContactId, setSelectedContactId] = useState(null);
  
  // const username = currentUser.username;
  const [to, setTo] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        try {
          const response = await axios.get('http://localhost:5000/home/contacts', { withCredentials: true });
          setContacts(response.data.contacts);
        } catch (error) {
          console.error("Error fetching contacts:", error.response?.data || error.message);
        }
      }
    };
    fetchContacts();
  }, [currentUser]);
  

  const filteredContacts = contacts.filter(contact => 
    contact.username.toLowerCase().includes(search.toLowerCase())
  );
  

  console.log("filteredContacts", filteredContacts)

  const toggleSettings = () => {
    setSettingsOpen((prev) => !prev);
  };


  const handleClickOutside = (event) => {

    if (settingsOpen && !event.target.closest('.settings-sidebar') && !event.target.closest('.fa-cog')) {
      setSettingsOpen(false);
    }
  };

 
  const addGlobalClickListener = () => {
    document.addEventListener("mousedown", handleClickOutside);
  };

  const removeGlobalClickListener = () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };


  if (settingsOpen) {
    addGlobalClickListener();
  } else {
    removeGlobalClickListener();
  }


  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/user/logout', {}, { withCredentials: true });
      console.log("response", response)

      
      if(response.status === 200){
        localStorage.removeItem('user');
        setCurrentUser(null);
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };


  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setSelectedContactId(contact._id);
  };

  return (
    <div className="relative w-1/4 bg-black p-5 shadow-md text-white">
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
            className={`mb-2 p-3 rounded-lg cursor-pointer transition-colors duration-300 ${
              selectedContactId === contact._id ? "bg-cyan-500 text-white" : "bg-black hover:bg-gray-900 hover:text-cyan-400"
            }`}
            onClick={() => handleContactClick(contact)}
          >
            {contact.username}
          </li>
        ))}
      </ul>

      {/* Settings Icon */}
      <div
        className="absolute bottom-5 left-5 text-cyan-400 cursor-pointer fa-cog"
        onClick={toggleSettings} // Toggle settings on click
      >
        <FaCog size={30} />
      </div>

      {/* Settings Sidebar */}
      <div
        className={`absolute bottom-0 left-0 w-full p-6 shadow-2xl rounded-tl-lg transition-all duration-700 ease-out transform settings-sidebar ${
          settingsOpen
            ? "translate-y-0 bg-gray-800 opacity-100"
            : "translate-y-full bg-transparent opacity-0"
        }`}
      >
        {settingsOpen && (
          <>
            <h3 className="text-lg text-cyan-400 font-bold mb-4">{currentUser.username}</h3>
            <StarBorder
              as="button"
              className="w-full mb-4"
              color="cyan"
              speed="5s"
              // onClick for change password
            >
              Change Password
            </StarBorder>
            <StarBorder
              as="button"
              className="w-full"
              color="red"
              speed="5s"
              onClick={handleLogout}
            >
              Logout
            </StarBorder>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
