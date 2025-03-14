import { useState } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";

const AiChat = ({ closeChat }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const userMessage = { role: "user", content: message };
    setChat((prevChat) => [...prevChat, userMessage]);
    setMessage("");
    setLoading(true);
    setError(null);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await axios.post(
        `${API_BASE_URL}/ai/ai-chat`,
        { message },
        {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
          withCredentials: true
        }
      );

      console.log("AI Response:", res.data);

      if (res.data.reply) {
        setChat((prevChat) => [...prevChat, { role: "ai", content: res.data.reply }]);
      } else {
        setError("Invalid AI response.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setError("Failed to get AI response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 bg-white p-5 shadow-md rounded-md w-[74.9%] h-[100%]  max-[375px]:w-screen max-[430px]:w-screen max-[414px]:w-screen max-[768px]:w-screen max-[1024px]:w-[930px] flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-blue-500">AI Chat</h3>
        <button onClick={closeChat} className="text-blue-500 text-3xl">
          <IoMdClose />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto border-t border-blue-500 p-2 space-y-3">
        {chat.map((msg, index) => (
          <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[60%] p-3 rounded-lg break-words ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* AI Loading Bubble (Three Dots) */}
        {loading && (
          <div className="flex w-full justify-start">
            <div className="max-w-[60%] p-3 rounded-lg bg-gray-200 text-black flex items-center">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-black rounded-full animate-pulse delay-100"></span>
                <span className="w-2 h-2 bg-black rounded-full animate-pulse delay-200"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Input Field */}
      <div className="flex mt-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-3  border border-blue-500 rounded-md text-black"
          placeholder="Ask something..."
        />
        <button onClick={sendMessage} className="custom-class shadow-lg shadow-indigo-500/50 ml-3 max-sm:mr-5 w-[10%] max-sm:w-[25%]  p-[10px] rounded-[10px] text-[#fff] text-[1.2rem] bg-[royalblue] hover:bg-[#385AC2] max-sm:fixed max-sm:ml-[17.6rem] max-md:fixed max-md:ml-[17.6rem] max-lg:fixed max-lg:right-0   max-xl:fixed max-xl:right-10"
         disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AiChat;
