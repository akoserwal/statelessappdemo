(function () {
  'use strict';

  angular.module('user').factory('UserService', userService);

  userService.$inject = ['KeyCloakService'];

  function userService(KeyCloakService) {
    var service = {};
    var user = {};
    var addressEditFlag = false;

    var isLoggedIn = function() {
      var token = KeyCloakService.getToken();
      return typeof token !== 'undefined' && token !== null
    };

    service.ensureLoggedIn = function (redirectTo) {
      debugger;
      var serviceInit = KeyCloakService.init();
      var token = KeyCloakService.getToken();
      if ((typeof token === 'undefined' || token === null) &&
          typeof redirectTo !== 'undefined' && redirectTo !== null) {
        KeyCloakService.setRedirectAfterLogin(redirectTo);
        KeyCloakService.login();
      }
      return serviceInit.promise;
    };

    service.isLoggedIn = isLoggedIn;

    service.getAuth = function() {
      return KeyCloakService.getToken();
    };

    service.logOut = function() {
      KeyCloakService.logout();
    };

    return service;
  }

}());
