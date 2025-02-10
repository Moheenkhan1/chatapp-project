import React from 'react'
import { FiArrowLeft } from "react-icons/fi";
import { FiPaperclip, FiPhone, FiX  } from "react-icons/fi";
import { FaCog } from "react-icons/fa";

const Debug = () => {

  const chat = [
    {
      sender: "Admin",
      message: {
        text: "Hello, How can I help you?",
      },
    },
    {
      sender: "send",
      message: {
        text: "I have a question about my order",
      },
    },
    {
      sender: "Admin",
      message: {
        text: "Sure, What is your order number?",
      },
    },
    {
      sender: "send",
      message: {
        text: "My order number is #123456",
      },
    },
    {
      sender: "Admin",
      message: {
        text: "Hello, How can I help you?",
      },
    },
    {
      sender: "send",
      message: {
        text: "I have a question about my order",
      },
    },
    {
      sender: "Admin",
      message: {
        text: "Sure, What is your order number?",
      },
    },
    {
      sender: "send",
      message: {
        text: "My order number is #123456",
      },
    },
    {
      sender: "Admin",
      message: {
        text: "Hello, How can I help you?",
      },
    },
    {
      sender: "send",
      message: {
        text: "I have a question about my order",
      },
    },
    {
      sender: "Admin",
      message: {
        text: "Sure, What is your order number?",
      },
    },
    {
      sender: "send",
      message: {
        text: "My order number is #123456",
      },
    },
    {
      sender: "Admin",
      message: {
        text: "Hello, How can I help you?",
      },
    },
    {
      sender: "send",
      message: {
        text: "I have a question about my order",
      },
    },
    {
      sender: "Admin",
      message: {
        text: "Sure, What is your order number?",
      },
    },
    {
      sender: "send",
      message: {
        text: "My order number is #7676",
      },
    }

  ]

  return (
    <div className={`relative w-1/4 max-md:w-full max-sm:w-full max-lg:w-full max-xl:w-full max-[768px]:w-full max-[1024px]:w-full max-[912px]:w-full max-[853px]:w-full bg-white p-5 shadow-md text-white overflow-auto`}>

<div className="fixed  top-0 left-0 w-1/4 max-md:w-full bg-white p-5 shadow-md z-10">
      <h2 className="text-[1.7rem] text-[#4169E1] font-extrabold mb-4">Chats</h2>
      <input
        type="text"
        placeholder="Search chats..."
        className="w-full p-2 bg-[#E8E8E8] text-black border border-gray-700 rounded-lg placeholder-black focus:outline-none focus:ring focus:ring-indigo-500"
      />
    </div>

      {/* Contacts List */}
      <ul className="mt-[18vh] overflow-auto">
        
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
          <li
            
            className={`flex items-center space-x-4 mb-1 shadow-md p-3  cursor-pointer transition-colors duration-300 `}
            
          >
            <div className="relative">
              <img
                className="w-[4rem] h-[4rem] ring rounded-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                src=''
                alt="profile"
                
              />
              {/* Online Status Indicator */}
              
            </div>
            <p className="text-xl">Admin</p>
          </li>
      </ul>

      {/* Settings Icon */}
      <div
        // Attach the ref to the settings icon
        className="fixed bottom-5 left-5 text-[#385AC2] cursor-pointer"
        
      >
        <FaCog size={30} />
      </div>

      {/* Settings Sidebar */}
      

      {/* Photo View */}
    </div>
  )
}

export default Debug