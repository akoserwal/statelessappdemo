var app = angular.module('myApp',['shared', 'user','ui.router']);


var intercept = function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
  };

  var appconfig = function ($stateProvider, $urlRouterProvider,$locationProvider){

        function verifyLogin(Config, UserService) {
             return UserService.ensureLoggedIn(Config.links.home);
           }

            var preview = {
                name: 'home',
                url: '/',
                templateUrl: 'index.html',
                controller:'AppCtrl',
                resolve: { 
                    loggedin: ['Config', 'UserService', verifyLogin]
                  }
              };

              $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
              });

              $stateProvider.state(preview);


};



app.config(['$httpProvider',intercept]);
app.config(['$stateProvider', '$urlRouterProvider','$locationProvider',appconfig]);
app.controller('AppCtrl',['$state','Config','UserService','$window', '$http','$scope',AppCtrl]);


function AppCtrl($state, Config, UserService,$window, $http, $scope){
    //$scope.name="Abhishek";
    var vm = this;

    vm.changeName = function(){
     $http.get('/rest/'+vm.name,{ headers: {Authorization: UserService.getAuth()}}).then(function(response){
                 $scope.data = response.data;
        }, function(error){
                 console.log(error);
        });
    }


}
