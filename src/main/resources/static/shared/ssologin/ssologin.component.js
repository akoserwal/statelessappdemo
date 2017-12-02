(function () {
  'use strict';

  angular.module('shared').component('ssologin', {
    controller: ['KeyCloakService', 'Config', ssoLoginController]
  });

  function findGetParameter(parameterName) {
    var result;
      location.search
      .substr(1)
      .split('&')
      .forEach(function (item) {
        var tmp = item.split('=');
        if (tmp[0] === parameterName) {
          result = decodeURIComponent(tmp[1]);
        }
      });
    return result;
  }

  function ssoLoginController(KeyCloakService, Config) {
    var to = findGetParameter('redirectTo');
    if (typeof to === 'undefined' || to === 'undefined' || to === '') {
      to = Config.links.home;
    }
    KeyCloakService.setRedirectAfterLogin(to);
  }

}());
