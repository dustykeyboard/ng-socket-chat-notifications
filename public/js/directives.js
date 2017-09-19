'use strict';

chatApp.directive('scrollBottom', function() {
  return {
    scope: {
      scrollBottom: '='
    },
    link: function(scope, element) {
      scope.$watchCollection('scrollBottom', function(newValue) {
        console.log('scrollBottom', scope, element, newValue);
        if (newValue) {
          element[0].scrollTop = element[0].scrollHeight;
        }
      });
    }
  };
});
