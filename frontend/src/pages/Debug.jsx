import React from 'react'
import { FiArrowLeft } from "react-icons/fi";
import { FiPaperclip, FiPhone, FiX } from "react-icons/fi";

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
    <div className="flex flex-col flex-1 bg-white max-sm:flex max-md:flex max-lg-flex max-xl-flex  max-[768px]:flex max-[1024px]:flex max-[912px]:flex max-[853px]:flex">
      {/* Chat Header with Profile Picture */}
      <div className="bg-[#385AC2] w-screen fixed text-black p-4 border-b border-gray-700 flex  items-center ">
      <button className="max-sm:block max-md:block max-lg-block max-xl-block max-[768px]:block max-[1024px]:block max-[912px]:block max-[853px]:bloc  hidden text-white text-xl mr-3" >
          <FiArrowLeft size={24} />
        </button>
        <div className="flex justify start gap-3 max-sm:ml-[1rem] max-md:ml-[1rem] max-lg:ml-[1rem] max-xl:ml-[1rem]">
          <img
            className="w-[3.5rem] h-[3.5rem] rounded-full object-cover ml-6 max-sm:ml-0 max-md:ml-0 max-lg:ml-0 max-xl:ml-0 ring "
            src='https://unsplash.com/photos/the-sun-is-shining-through-the-trees-in-the-forest-KZwrFH42JCg'
            alt="Profile"
          />
          <div className=" ml-4 max-sm:ml-2 max-md:ml-2 max-lg:ml-2 max-xl:ml-2" >

          <h2 className="text-[1.2rem] font-bold text-white">Admin</h2>
          <span
            className='text-green-500 '  
          >
            Online
          </span>

          </div>
        </div>
        {/* <button className="text-cyan-400 hover:text-cyan-300">
          <FiPhone size={24} />
        </button> */}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 mt-[6rem] mb-16 overflow-scroll bg-white text-black">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-2 ${msg.sender === "send" ? "justify-end" : "justify-start"}`}
          >
            {msg.message?.text && (
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender === "send" ? "bg-[#4169E1] text-white" : "bg-gray-700 text-white"
                }`}
              >
                <p>{msg.message.text}</p>
              </div>
            )}
          </div>
        ))}
        <div />
      </div>



      {/* Message Input */}
      <form  className="bg-[#E8E8E8] border-t-2 border-[#4169E1] p-4 flex items-center fixed bottom-0">
      <label
          htmlFor="file-input"
          className="cursor-pointer ml-2 text-[#4169E1] hover:text-[#4169E1]-300 pr-3"
        >
          <FiPaperclip size={23} />
        </label>
        <input
          type="text"
          placeholder="Type a message"
          className="bg-white text-black w-full max-sm:w-[60%] p-3 rounded-md focus:outline-none"
        />
        <input
          type="file"
          className="hidden"
          id="file-input"
        />
        <button
          className="custom-class shadow-lg shadow-indigo-500/50 ml-3 w-[10%] max-sm:w-[20%]  p-[10px] rounded-[10px] text-[#fff] text-[1.2rem] bg-[royalblue] hover:bg-[#385AC2]  "
           type="submit"   
          >
            Send
        </button>
                
        
      </form>
    </div>
  )
}

export default Debug