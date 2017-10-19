'use strict';

chatApp.factory('notification', function($rootScope) {
  return {
    show: data => {
      console.log('notification.show', data);
      if (!window.Notification) return; // Notifications not supported

      if (Notification.permission === 'granted') {
        var n = new Notification(`${data.name}: ${data.message}`);
      } else if (Notification.permission !== 'denied') {
        // Requesting Notifications permission
        Notification.requestPermission(permission => {
          if (permission === 'granted') {
            var n = new Notification(`${data.name}: ${data.message}`);
          }
        });
      }
    }
  };
});
