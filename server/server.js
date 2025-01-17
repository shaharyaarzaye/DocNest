const { Server } = require("socket.io");

const io = new Server(3002, {
    cors: {
        origin: "https://effective-waffle-46xv5jpg56jf6wp-5173.app.github.dev/", // Your client URL
        methods: ["GET", "POST"],
    },
});


io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('send-changes', (delta) => {
      console.log('Received delta:', delta);
      // Broadcast the changes to other clients (excluding the sender)
      socket.broadcast.emit('receive-changes', delta);
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

console.log("Socket.IO server running on port 3002");