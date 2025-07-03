const WebSocket = require("ws");

// Use Render's provided PORT or default to 8080 for local development
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });
const clients = new Map(); // userId -> ws

wss.on("connection", (ws, req) => {
  const origin = req.headers.origin;
  const allowedOrigin = "https://aiwoox.in";
  if (origin !== allowedOrigin) {
    ws.terminate();
    return;
  }

  let currentUserId = null;

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "register") {
        currentUserId = data.userId;
        clients.set(currentUserId, ws);
        console.log(`User registered: ${currentUserId}`);
      }

      if (data.type === "call-user") {
        const { from, to, meetingParams } = data;
        const targetWs = clients.get(to);
        if (targetWs) {
          targetWs.send(
            JSON.stringify({
              type: "incoming-call",
              from,
              meetingParams,
            })
          );
        }
      }

      if (data.type === "call-response") {
        const { from, to, accepted } = data;
        const targetWs = clients.get(to);
        if (targetWs) {
          targetWs.send(
            JSON.stringify({
              type: accepted ? "call-accepted" : "call-rejected",
              from,
            })
          );
        }
      }
    } catch (err) {
      console.error("Error handling message:", err.message);
    }
  });

  ws.on("close", () => {
    if (currentUserId) {
      clients.delete(currentUserId);
      console.log(`User disconnected: ${currentUserId}`);
    }
  });
});

console.log(`WebSocket server running on port ${PORT}`);
