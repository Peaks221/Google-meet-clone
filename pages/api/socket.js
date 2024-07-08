import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  console.log("server is connected");
  if (res.socket.server.io) {
    console.log("server already running");
    return;
  }
  const io = new Server(res.socket.server);
  res.socket.server.io = io;
  io.on("connection", socket => {
    console.log("server is created");
    socket.on("join-room", (roomId, userId) => {
      console.log(`a new user ${userId} joined room ${roomId}`);
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", userId);
    });

    socket.on("user-toggle-audio", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
    });

    socket.on("user-toggle-video", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-toggle-video", userId);
    });

    socket.on("user-leave", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-leave", userId);
    });
  });

  res.end();
};

export default SocketHandler;
