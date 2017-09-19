var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var random_name = require('node-random-name');
var port = process.env.PORT || 3000;

var users = {};

const user = socket => ({ id: socket.id, name: users[socket.id].name });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', socket => {
  users[socket.id] = {
    id: socket.id,
    name: random_name({ first: true })
  };
  socket.emit('rename', user(socket));
  io.emit('users', users);
  socket.broadcast.emit('connected', user(socket));
  console.log(`${users[socket.id].name} connected (${socket.id})`);

  socket.on('message', ({ channel = 'Everyone', message }) => {
    if (!message) return;

    const name = users[socket.id].name;
    if (channel === 'ALL') {
      socket.broadcast.emit('message', {
        channel,
        name,
        message
      });
    } else {
      socket.to(channel).emit('message', {
        channel: socket.id, // reverse channel for recipient
        name,
        message
      });
    }
  });

  socket.on('rename', (name, callback) => {
    const taken = Object.values(users).find(user => user.name === name);
    if (taken) return callback(false);

    users[socket.id].name = name;
    socket.broadcast.emit('rename', {
      id: socket.id,
      name: users[socket.id].name
    });
    callback(true);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('disconnected', user(socket));
    console.log(
      'notice',
      `${users[socket.id].name} disconnected (${socket.id})`
    );
    delete users[socket.id];
    io.emit('users', users);
  });
});

http.listen(port, function() {
  console.log('listening on *:' + port);
});
