import React, { useState } from "react";
import { FaCog } from "react-icons/fa";
import StarBorder from '../components/StarBorderButton';

const Sidebar = ({ setSelectedContact }) => {
  const [search, setSearch] = useState(""); 
  const [settingsOpen, setSettingsOpen] = useState(false); 

  const contacts = ["ABHI", "MOHIN", "LALALA", "HUHUHUH"]; 
  const username = "User123"; 


  const filteredContacts = contacts.filter((contact) =>
    contact.toLowerCase().includes(search.toLowerCase())
  );


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
        {filteredContacts.map((contact, index) => (
          <li
            key={index}
            className="mb-2 p-3 bg-black rounded-lg cursor-pointer hover:bg-gray-900 hover:text-cyan-400"
            onClick={() => setSelectedContact(contact)} // Set the selected contact
          >
            {contact}
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
            <h3 className="text-lg text-cyan-400 font-bold mb-4">{username}</h3>
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
              // onClick for logout
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
