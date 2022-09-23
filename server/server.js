const express = require("express");
const cors = require("cors");
const socket = require("socket.io");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoute");
const chatmessageRoutes = require("./routes/chatmessageRoute");
const chatRoomRoutes = require("./routes/chatroomRoute");
const smsRoutes = require("./routes/smsRoute");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use("/api/user", userRoutes);
app.use("/api/chatmessage", chatmessageRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/room", chatRoomRoutes);

global.allUsers = new Map();
io.on("connection", (socket) => {
  //PERSONAL CHAT
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    allUsers.set(userId, socket.id);
  });
  socket.on("send-message", (data) => {
    const sendUserSocket = allUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("chat", data);
      socket.to(sendUserSocket).emit("chat-inbox", data);
    }
  });

  //GROUP CHAT
  socket.on("join-room", (room) => {
    socket.join(room.roomname);
  });
  socket.on("send-room-message", (data) => {
    io.in(data.room).emit("chatroom", data);
  });

  //PERSONAL CALL
  socket.on("call-user", (data) => {
    const sendUserSocket = allUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("call-user", {
        signal: data.signalData,
        from: data.from,
        to: data.to,
        callername: data.name,
        calltype: data.calltype,
      });
    }
  });

  socket.on("check-call", (data) => {
    const sendUserSocket = allUsers.get(data.from);
    io.to(sendUserSocket).emit("check-call", {
      status: "available",
      type: data.type,
    });
  });

  socket.on("answer-call", (data) => {
    const sendUserSocket = allUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("call-accepted", data.signal);
    }
  });

  socket.on("user-hanged-up", (data) => {
    const sendUserSocket = allUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("user-hanged-up", data);
    }
  });

  socket.on("user-is-busy", (data) => {
    const sendUserSocket = allUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("user-is-busy", data);
    }
  });

  socket.on("end-call", (data) => {
    const sendUserSocket = allUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("end-call", data);
    }
  });

  socket.on("disconnect", () => {});
});
