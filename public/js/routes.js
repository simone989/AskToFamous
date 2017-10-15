var app = angular.module('app');

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/home');

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'partials/home.html',
      controller: 'homeController'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'loginController'
   })
   .state('register', {
      url: '/register',
      templateUrl: 'partials/register.html',
      controller: 'registerController'
    })
    .state('profile', {
       url: '/profile',
       templateUrl: 'partials/profile.html',
       controller: 'profileController'
     })
     .state('profileCreator', {
        url: '/profileCreator',
        templateUrl: 'partials/profileCreator.html',
        controller: 'profileControllerCreator'
      })
     .state('registerCreator', {
        url: '/registerCreator',
        templateUrl: 'partials/registerCreator.html',
        controller: 'registerCreator'
      });
});
