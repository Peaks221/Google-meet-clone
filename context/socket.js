import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const connection = io();
    console.log(connection);
    setSocket(connection);
  }, []);
  socket?.on("connect_error", async err => {
    console.log("error establishing connections");
    await fetch("/api/socket");
  });
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
