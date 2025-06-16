const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const port = process.env.PORT || 5000;
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');
app.use(router);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) {
      return callback(error);
    }
    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
    socket.join(user.room);
    console.log(`${name} has joined room ${room}`);
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    console.log(`Message received: ${message}`);
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', { user: user.name, text: message });
    }
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', `${user.name} has left.`);
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});