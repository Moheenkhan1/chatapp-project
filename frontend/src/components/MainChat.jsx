import React, { useState } from "react";
import StarBorder from '../components/StarBorderButton';

const MainChat = ({ selectedContact }) => {
  const [input, setInput] = useState(""); // For input field value only

  if (!selectedContact) {
    // Show the welcome screen if no contact is selected
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white relative">
        <div className="text-center relative z-10">
          <h1 className="text-4xl font-bold text-cyan mb-4">
            Chat App Project
          </h1>
          <p className="text-lg text-cyan-400">
            Select a contact to start chatting!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-black">
      {/* Chat Header */}
      <div className="bg-black text-white p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-cyan-400">{selectedContact}</h2>
      </div>

      {/* Chat Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-cyan text-white">
        <p className="text-center text-cyan-400">
          Start chatting with {selectedContact}.
        </p>
      </div>

      {/* Input and Send Button */}
      <div className="flex items-center p-4 bg-black border-t border-gray-700">
        <input
          type="text"
          placeholder={`Message ${selectedContact}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)} // Updates input value only
          className="flex-1 p-2 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-black text-white placeholder-cyan-400"
        />
        {/* <button
          className="ml-4 px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-600"
          onClick={() => alert("empty")} // Placeholder action
        >
          Send
        </button> */}

        <StarBorder
            as="button"
            className="custom-class ml-[2.2rem] w-[10%] "
            color="cyan"
            speed="5s"
            //onClick=()
          >
            Send
          </StarBorder>
      </div>
    </div>
  );
};

export default MainChat;
