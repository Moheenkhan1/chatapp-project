import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import MainChat from "../components/MainChat";

const Home = () => {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar setSelectedContact={setSelectedContact}  />
      <div className="w-[1px] bg-cyan-400"></div>
      <MainChat selectedContact={selectedContact}  />
    </div>
  );
};

export default Home;
