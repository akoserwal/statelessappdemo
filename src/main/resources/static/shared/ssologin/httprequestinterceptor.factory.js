(function () {
  'use strict';

  angular.module('shared').factory('httpRequestInterceptor', httpRequestInterceptor);

  httpRequestInterceptor.$inject = ['KeyCloakService'];

  function httpRequestInterceptor(KeyCloakService) {
    return {
      request: function (config) {
        var token = KeyCloakService.getToken();

        if (typeof token !== 'undefined' && config.method === 'POST') {
          config.headers['Authorization'] = token;
        }

        return config;
      }
    };
  }
}());
