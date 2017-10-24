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
        controller: 'registerCreatorController'
      })
      .state('questionPage',{
        url: '/questionPage',
        templateUrl: '/partials/questionPage.html',
        controller: 'questionPageController',
        params: {
          name: "",
          image: "",
          platform: ""
        }
      })
      .state('allQuestion',{
        url: '/allQuestion',
        templateUrl: '/partials/allQuestion.html',
        controller: 'allQuestionController'
      })
      .state('find',{
        url: '/find',
        templateUrl: '/partials/find.html',
        controller: 'findController'
      })
      .state('createQuestion',{
        url: '/createQuestion',
        templateUrl: '/partials/createQuestion.html',
        controller: 'createQuestionController',
        params:{
          name: "",
          image: "",
          platform:"",
        }
      })
      .state('singleQuestionPage',{
        url: '/singleQuestionPage',
        templateUrl: '/partials/singleQuestionPage.html',
        controller: 'singleQuestionPageController',
        params:{
          idQuestion: "",
        }
      })
      .state('balance',{
        url: '/balance',
        templateUrl: '/partials/balance.html',
        controller: 'balanceController'
      })
});
