'use strict';

chatApp.controller('ChatCtrl', function($scope, socket) {
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

  $scope.setChannel = channel => ($scope.channel = channel);

  const showNotification = data => {
    if (!window.Notification) return; // Notifications not supported

    if (Notification.permission === 'granted') {
      new Notification(`${data.name}: ${data.message}`);
    } else if (Notification.permission !== 'denied') {
      // Requesting Notifications permission
      Notification.requestPermission(permission => {
        if (permission === 'granted') {
          new Notification(`${data.name}: ${data.message}`);
        }
      });
    }
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
      showNotification(data);
    }
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
  socket.on('rename', ({ id, name }) => {
    console.log('rename', { id, name, socket });
    if (id === socket.id()) $scope.name = name;
    else $scope.users[id].name = name;
  });

  socket.on('users', data => {
    $scope.users = data;
  });

  socket.on('message', data => {
    console.log('received message', { data });
    addMessage(data);
  });

  socket.on('notice', data => {
    console.log('received notice', data);
  });

  window.onfocus = () => ($scope.inBackground = false);
  window.onblur = () => ($scope.inBackground = true);
});
