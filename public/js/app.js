var app = angular.module('app', [ 'ui.router',
                                  'ui.bootstrap',
                                  'ui-notification',
                                  'ngStorage',
                                  'angular-loading-bar',
                                  'ngFileUpload',
                                ]);

var path = "http://localhost:3000/";

app.run(function($rootScope, $localStorage,$window, $state, Notification){
  $rootScope.user = ($localStorage.user != null && $localStorage.user.token != "") ? $localStorage.user : "";

  $rootScope.logout = function() {
    $rootScope.user = "";
    $localStorage.user = "";
    Notification.success("Logout successfully");
    $state.go("login");
  };

  $rootScope.myQuestion = function(){
    $state.go('questionPage',{name: $rootScope.user.name, image: $rootScope.user.profileImage, platform: $rootScope.user.platform})
  }

  $window.onbeforeunload = function (e) {
    var confirmation = {};
    var event = $rootScope.$broadcast('onBeforeUnload', confirmation);
    if (event.defaultPrevented) {
        return confirmation.message;
    }
};
   // handle the exit event



});
