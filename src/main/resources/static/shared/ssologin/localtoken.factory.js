(function () {
  'use strict';

  angular.module('shared').factory('localTokenFactory', localToken);

  localToken.$inject = ['$window'];

  function localToken($window) {
    return {
      set: function (name, token) {
        $window.localStorage.setItem(name, token);
      },
      get: function (name) {
        return $window.localStorage.getItem(name);
      },
      delete: function (name) {
        return $window.localStorage.removeItem(name);
      }
    };
  }
}());
