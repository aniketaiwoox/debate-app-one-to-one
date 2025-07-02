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

io.on("connection", (socket) => {
 
 


  

  const PORT = 5050;
  server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
  });
});
