const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(
  cors({
    origin: "https://aiwoox.in",
    methods: "GET,POST",
    credentials: true,
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://aiwoox.in"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const userSocketMap = {}; // Maps userId -> socket.id

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User registered: ${userId} => ${socket.id}`);
  });

  socket.on("start-call", ({ callerId, receiverId }) => {
    const targetSocket = userSocketMap[receiverId];
    if (targetSocket) {
      io.to(targetSocket).emit("call-init", { callerId, receiverId });
      console.log(`Call init sent from ${callerId} to ${receiverId}`);
    } else {
      console.warn(`Receiver ${receiverId} not connected yet.`);
    }
  });

  socket.on("offer", ({ to, offer, from }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("offer", { offer, from });
      console.log(`Offer sent from ${from} to ${to}`);
    }
  });

  socket.on("answer", ({ to, answer, from }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("answer", { answer, from });
      console.log(`Answer sent from ${from} to ${to}`);
    }
  });

  socket.on("ice-candidate", ({ to, candidate, from }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate, from });
      console.log(`ICE candidate sent from ${from} to ${to}`);
    }
  });

  socket.on("call-end", ({ to }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-end");
      console.log(`Call end sent to ${to}`);
    }
  });
  
  socket.on("disconnect", () => {
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });

});

const PORT = 5050;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
