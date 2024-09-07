const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const options = {
    origin: 'http://localhost:3000',
};
app.use(cors(options));

// Set the view engine of the Express app to "ejs"
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Store clients and their assigned colors
let clients = {};

io.on("connection", (socket) => {
    console.log('Client connected:', socket.id);

    // Generate a random color for the new client
    const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    clients[socket.id] = color; // Assign color to the client

    // Listen for location updates from the client
    socket.on('send-location', (data) => {
        // Broadcast the location and color to all connected clients
        io.emit('receive-location', { id: socket.id, color: clients[socket.id], ...data });
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Notify other clients that this user has disconnected
        io.emit('user-disconnected', socket.id);
        // Remove client from clients list
        delete clients[socket.id];
    });
});


app.get('/', (req, res) => {
    res.render('index');
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
