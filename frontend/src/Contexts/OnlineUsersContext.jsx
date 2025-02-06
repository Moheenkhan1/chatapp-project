import React, { createContext, useState, useContext } from 'react';

const OnlineUsersContext = createContext();

export const OnlineUsersProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  if (!context) {
    throw new Error('useOnlineUsers must be used within an OnlineUsersProvider');
  }
  return context;
};