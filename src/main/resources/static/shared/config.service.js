(function () {
  'use strict';

  angular.module('shared').factory('Config', config);

  function config() {
    var service = {};


    service.links = {
      home: '/',
      login: 'http://localhost:8081/auth/',
      logout: 'http://localhost:8081/auth/',
      preview: '/preview',
      ssoInterstitial: 'sso.html'
    };


    service.keycloak = {
      realm: 'EmployeeIDP',
      clientId: 'demostate',
      url:'http://localhost:8081/auth/'
    };

    service.storage = {
      'token': 'jwt',
      'refreshToken': 'jwt_refresh'
    };



    return service;
  }

}());
