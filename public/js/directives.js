'use strict';

chatApp.directive('scrollBottom', () => ({
  scope: {
    scrollBottom: '='
  },
  link: function(scope, element) {
    scope.$watchCollection('scrollBottom', function(newValue) {
      if (newValue) element[0].scrollTop = element[0].scrollHeight;
    });
  }
}));
