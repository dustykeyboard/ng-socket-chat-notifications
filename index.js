var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var userCount = 0;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('welcome!')
  console.log('a user connected');
  userCount++;

  io.emit('message', `There ${userCount != 1 ? 'are' : 'is'} ${userCount} user${userCount != 1 ? 's' : ''}`);

  socket.on('message', function(message) {
    console.log('message', message);
    io.emit('message', message);
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
    userCount--;
  });
});

http.listen(port, function() {
  console.log('listening on *:' + port);
});
