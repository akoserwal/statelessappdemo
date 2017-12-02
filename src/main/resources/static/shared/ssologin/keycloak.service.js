(function () {
  'use strict';

  angular.module('shared').factory('KeyCloakService', keycloakService);

  keycloakService.$inject = ['localTokenFactory', '$window', 'Config', '$interval', '$q'];

  function keycloakService(localTokenFactory, $window, Config, $interval, $q) {
    var service = {};
    var redirectURL;
    var keycloak = Keycloak(Config.keycloak);
   
 

    var startRefreshLoop = function(defer) {
      updateToken(defer);
      // 600000 milliseconds = 60 seconds.
      // Call update token once a minute. Note: It will not refresh the token this often.
      $interval(updateToken, 60000);
    };

    var updateToken = function(defer) {
      // Update the token ONLY if it will expire in 90 seconds or less.
      keycloak
        .updateToken(90)
        .success(function(refreshed) {
          if (refreshed) {
            setToken(keycloak.token);
            setRefreshToken(keycloak.refreshToken);
            if (typeof defer !== 'undefined') {
              defer.resolve();
            }
          }
        });
    };

    var setToken = function (token) {
      localTokenFactory.set(Config.storage.token, token);
    };

    var setRefreshToken = function (token) {
      localTokenFactory.set(Config.storage.refreshToken, token);
    };

    var removeTokens = function() {
      localTokenFactory.delete(Config.storage.token);
      localTokenFactory.delete(Config.storage.refreshToken);
    };

    var getToken = function() {
      return localTokenFactory.get(Config.storage.token);
    };

    var login = function() {
      // Double URI encode to get around the Keycloak server decoding it once already.
      // This allows us to have a # in the URL to redirect to. 
      var redirectTo = $window.location.origin + '/' + Config.links.ssoInterstitial + '?redirectTo=' + encodeURIComponent(redirectURL);
      keycloak.login({
        redirectUri: redirectTo
      });
    };

    var init = function() {
      var initDefer = $q.defer();
      var initOptions = {
        responseMode: 'fragment',
        flow: 'standard'
      };
      var token = localTokenFactory.get(Config.storage.token);
      var refreshToken = localTokenFactory.get(Config.storage.refreshToken);
      if (typeof token !== 'undefined') {
        initOptions.token = token;
      }
      if (typeof refreshToken !== 'undefined') {
        initOptions.refreshToken = refreshToken;
      }

      keycloak.init(initOptions)
        .success(function (auth) {
          if (auth) {
            setToken(keycloak.token);
            setRefreshToken(keycloak.refreshToken);
            startRefreshLoop(initDefer);
            if (!keycloak.isTokenExpired()) {
              initDefer.resolve();
            }
            if (typeof redirectURL !== 'undefined') {
              $window.location.href = redirectURL;
            }
          }
          else {
            var currentToken = getToken();
            removeTokens();
            initDefer.reject();
            if (typeof currentToken !== 'undefined' && currentToken !== null) {
              redirectURL = $window.location.pathname + $window.location.hash;
            
              // Auth has failed but the user HAD tokens.
              // This means their token has expired on the server. We need a new one.
              login();
            }
          }
        });
      Config.links.login = keycloak.createLoginUrl();
      Config.links.logout = keycloak.createLogoutUrl();
      return initDefer;
    };


    // Force a new login if user is logged in but an error happens.
    keycloak.onAuthRefreshError = function () {
      redirectURL = $window.location.pathname+$window.location.hash;
      removeTokens();
      login();
    };

    keycloak.onTokenExpired = keycloak.onAuthRefreshError;

    service.init = init;

    service.login = login;

    service.setRedirectAfterLogin = function(url) {
      redirectURL = url;
    };

    service.getToken = getToken;

    service.logout = function() {
      removeTokens();
      $window.location.href = Config.links.logout;
    };

    (function() {
      init();
    }());

    return service;
  }

}());
