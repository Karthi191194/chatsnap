//Access Chat Form
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//Join Chatroom(Browser to Server)
socket.emit('joinRoom', {username, room});

//Get room & users
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
});

//Trigger on 'message' event | Message from Server
socket.on("message", (message) => {
  //console.log(message)
  outputMessage(message);

  //Scroll down to message bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Chat Form Message Submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  //Emit message to server(Browser to Server)
  socket.emit("chatMessage", msg);

  //Clear input & focus
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta"> ${message.username} <span> ${message.time}</span></p>
    <p class="text">
      ${message.msg}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room){
  roomName.innerHTML = room;
}

function outputUsers(users){
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}