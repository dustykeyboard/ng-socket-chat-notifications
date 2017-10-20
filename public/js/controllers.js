'use strict';

chatApp.controller('ChatCtrl', function($scope, socket, notifications) {
  $scope.name = '...';
  $scope.channel = 'ALL';
  $scope.history = {};
  $scope.users = {};
  $scope.message = '';
  $scope.inBackground = false;

  $scope.getUser = id => $scope.users[id];

  $scope.getUserName = id => $scope.users[id] && $scope.users[id].name;

  $scope.getChannelName = id => {
    return $scope.getUserName(id) || 'ALL';
  };

  $scope.setChannel = channel => {
    $scope.channel = channel;
    resetUnread(channel);
  };

  const addMessage = data => {
    if (!$scope.history[data.channel]) {
      $scope.history[data.channel] = {
        messages: [],
        unread: 0
      };
    }
    $scope.history[data.channel].messages.push(data);
    if (data.channel !== $scope.channel || $scope.inBackground) {
      $scope.history[data.channel].unread++;
      notifications.show(data);
    }
  };

  const resetUnread = channel => {
    if (!$scope.history[channel]) return;
    $scope.history[channel].unread = 0;
  };

  /* UI to changeName and send newName */
  $scope.changeName = () => {
    console.log('changeName()');
    const newName = prompt('New name', $scope.name);
    if (newName) {
      socket.emit('rename', newName, function(result) {
        if (!result) return alert('That name is not available');
        $scope.name = newName;
        $scope.users[socket.id()].name = newName;
      });
    }
  };

  /* Send message */
  $scope.sendMessage = () => {
    if ($scope.message) {
      socket.emit('message', {
        channel: $scope.channel,
        message: $scope.message
      });

      addMessage({
        channel: $scope.channel,
        name: $scope.name,
        message: $scope.message
      });

      $scope.message = '';
    }
  };

  /* Listening to socket events */
  socket.on('rename', data => {
    console.log('rename', data);
    if (data.id === socket.id()) $scope.name = data.name;
    else $scope.users[data.id] = data;
  });

  socket.on('users', data => {
    console.log('received users', data);
    $scope.users = data;
  });

  socket.on('message', data => {
    console.log('received message', data);
    addMessage(data);
  });

  socket.on('notice', data => {
    console.log('received notice', data);
  });

  window.onfocus = () => {
    $scope.inBackground = false;
    resetUnread($scope.channel);
  };
  window.onblur = () => ($scope.inBackground = true);
});
