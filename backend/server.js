const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const colors = require("colors");
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { log } = require('console');

connectDB();

const app = express();

app.use(cors());

app.use(express.json()); //to accept json data

// app.get('/', (req, res) => {
//     res.send("API is running");
// })

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/message", messageRoutes);

// -------------------------- Deployment ------------------------------

const __dirname1 = path.resolve(); //current working directory: path module comes from nodejs

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running (after build)");
  });
}

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(5000, 
    console.log(`Server started at port ${PORT}`.yellow.bold)
);

// ----------------- SOCKET.IO ------------------

const io = require("socket.io")(server, {
    pingTimeout: 60000, //amount of time it will take while being inactive (after 60 seconds, it will close the connection to save bandwidth)
    cors: {
        origin: "*"
    },
});

io.on("connection", (socket) => {

    // 'on' function for setup
    socket.on("setup", (userData) => {
        socket.join(userData._id); 
        socket.emit("connected");
    });

    console.log("Connected to socket.io"); //connection done
    
    socket.on("join chat", (room) => {
        socket.join(room); // User joins the newly created room , a room is created with the id of room
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));

    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if( !chat.users ) return console.log("chat.users is not defined");

        // the message i've sent should only be received to other members of the group
        chat.users.forEach((user) => {
            if(user._id == newMessageReceived.sender._id)   return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.off("setup", () => {
        console.log("User Disconnected");
        socket.leave(userData._id);
    });
});