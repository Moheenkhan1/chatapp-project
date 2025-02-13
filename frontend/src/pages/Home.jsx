import React, { useState, useEffect, useContext , useRef} from "react";
import Sidebar from "../components/Sidebar";
import MainChat from "../components/MainChat";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../Contexts/UserContext";
import { io } from 'socket.io-client'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Access env variable

  const socket = useRef(null);

  const [selectedContact, setSelectedContact] = useState(null);
  const navigate = useNavigate();
  const { user , setUser } = useContext(UserDataContext); // Assuming user context is correctly set
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]); // Stores the list of contacts 
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedContactId, setSelectedContactId] = useState(null);


  const [showChat, setShowChat] = useState(false); // Controls sidebar/chat visibility for responsive design on phone and tab

// authorizes user and sets current user

useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/home/auth`, {}, { withCredentials: true });

      console.log(response.data)

      if (response.status === 200) {
        const userData = response.data;
        setCurrentUser(userData);
        setUser(userData); // Update UserContext
      }
    } catch (error) {
      console.error("Error fetching user:", error.response?.data || error.message);
      navigate("/login"); // Redirect if authentication fails
    }
  };

  fetchUser();
}, [navigate, setCurrentUser, setUser]);  // useEffect runs on change of any of these three


  
  // socket connection to establish logged in user
  useEffect(()=>{
    if(currentUser){
      socket.current = io(`${API_BASE_URL}`, { withCredentials: true });
      socket.current.emit("add-user",currentUser._id);
    }
  },[currentUser])

  useEffect(() => {
    if (!socket.current) {
      console.warn("⚠️ Socket is not connected.");
      return;
    }

    console.log("✅ Listening for incoming messages...");

    socket.current.on("msg-receive", (msg) => {
      console.log("📩 Incoming message received globally:", msg); // Debugging Log
    
      if (!msg) {
        console.error("❌ Message object is undefined!");
        return;
      }
    
      setUnreadCounts((prev) => ({
        ...prev,
        [msg.from]: (prev[msg.from] || 0) + 1,
      }));
    
      
      // ✅ Show a toast notification (only if message is not from the active chat)
      if (msg.from !== selectedContactId) {
        let notificationMessage = "";
        
        if (msg.message && msg.file) {
          notificationMessage = `💬📁 New Chat from `;
        } else if (msg.file) {
          notificationMessage = `📁 New File from `;
        } else if (msg.message) {
          notificationMessage = `💬 New Message from `;
        }

        toast.info(
          <div>
            {notificationMessage}
            <span className="font-bold text-blue-500">{msg.username}</span> {/* Styled Username */}
            {`: ${msg.message || "File Received"}`}
          </div>,
          {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
      }
    });

    return () => {
      if (socket.current) {
        socket.current.off("msg-receive");
        console.log("🔴 Stopped listening for messages");
      }
    };
  }, [socket.current]);


  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentUser || !currentUser._id) return;

    if (!socket.current) {
      socket.current = io(`${API_BASE_URL}`, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 5000,
      });

      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current.id);
        socket.current.emit("add-user", currentUser._id);
      });
      
      // socket connection for checking online users
      socket.current.on("update-user-status", ({ userId, isOnline }) => {
        console.log(`User ${userId} is now ${isOnline ? "Online" : "Offline"}`);
      });

      
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [currentUser]);

  // Fetch contacts from the server
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`${API_BASE_URL}/home/contacts`, { withCredentials: true });
          setContacts(response.data.contacts);
        } catch (error) {
          console.error("Error fetching contacts:", error.response?.data || error.message);
        }
      }
    };

    fetchContacts();
  }, [currentUser]);


  return (
    <div className="flex h-screen">
      {/* <ToastContainer /> */}
      <Sidebar 
      setSelectedContact={setSelectedContact} 
      currentUser={currentUser} 
      setCurrentUser={setCurrentUser} 
      contacts={contacts} 
      socket={socket} 
      setShowChat={setShowChat} 
      showChat={showChat} 
      setUnreadCounts={setUnreadCounts} 
      unreadCounts={unreadCounts}
      selectedContactId={selectedContactId}
      setSelectedContactId={setSelectedContactId}
       />
      <div className="w-[1px] bg-[#4169E1] "></div>
      <MainChat 
      selectedContact={selectedContact} 
      currentUser={currentUser} 
      socket={socket} 
      setCurrentUser={setCurrentUser} 
      setShowChat={setShowChat} 
      showChat={showChat} 
      setUnreadCounts={setUnreadCounts} 
      unreadCounts={unreadCounts}
      selectedContactId={selectedContactId}
      setSelectedContactId={setSelectedContactId}
       />
    </div>
  );
};

export default Home;
