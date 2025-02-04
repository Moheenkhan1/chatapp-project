import React, { useState, useEffect, useContext , useRef} from "react";
import Sidebar from "../components/Sidebar";
import MainChat from "../components/MainChat";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../Contexts/UserContext";
import { io } from 'socket.io-client'

const Home = () => {
  const socket = useRef();

  const [selectedContact, setSelectedContact] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(UserDataContext); // Assuming user context is correctly set
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]); // Stores the list of contacts

  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      setCurrentUser(JSON.parse(userFromStorage)); // Set current user from localStorage
    } else {
      navigate('/login'); // Redirect to login if user is not found
    }

    // const authResponse = async()=>{

    //   const response = await axios.post('http://localhost:5000/home/auth', { withCredentials: true })

    //   if(response.status !== 200){
    //     navigate('/login')
    //   }

    // }


  }, [navigate]);

  useEffect(()=>{
    if(currentUser){
      socket.current = io("http://localhost:5000", { withCredentials: true });
      socket.current.emit("add-user",currentUser._id);
    }
  },[currentUser])

  // Fetch contacts from the server (assuming this API exists)
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

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar setSelectedContact={setSelectedContact} currentUser={currentUser} setCurrentUser={setCurrentUser} contacts={contacts} socket={socket} />
      <div className="w-[1px] bg-cyan-400"></div>
      <MainChat selectedContact={selectedContact} currentUser={currentUser} socket={socket} setCurrentUser={setCurrentUser} />
    </div>
  );
};

export default Home;
