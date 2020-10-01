const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  userLeave,
  getCurrentUser,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Each app.use(middleware) is called every time a request is sent to the server.
//Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatSnap Bot";

//Run when client connects to socket
io.on("connection", (socket) => {
  //console.log('New WebSocket Connection...')

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Single user who connected
    socket.emit("message", formatMessage(botName, "Welcome to ChatSnap!"));
    //Everybody except the user who connects
    /*socket.broadcast.emit(
      "message",
      formatMessage(botName, "A user has joined the chat")
    );*/
    //Everybody except the user who connects on a single room
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    /*Everbody
    io.emit();*/

    //Send users & room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //List for Chat Msg(From Browser)
  socket.on("chatMessage", (msg) => {
    //Get details of user who msgged
    const user = getCurrentUser(socket.id);
    //Send the Chat Msg back to Browser(To all users)
    //io.emit("message", formatMessage("User", msg));
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      //Send users & room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 8000 || process.env.PORT;

//app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
