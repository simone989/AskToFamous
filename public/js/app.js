var app = angular.module('app', [ 'ui.router',
                                  'ui.bootstrap',
                                  'ui-notification',
                                  'ngStorage',
                                  'angular-loading-bar',
                                  'ngFileUpload',
                                  'jsTag',
                                ]);

var path = "http://localhost:3000/";

app.run(function($rootScope, $localStorage, $window, $state, Notification, $http){
  $rootScope.user = ($localStorage.user != null && $localStorage.user.token != "") ? $localStorage.user : "";
  $rootScope.numberNotify = 0
  $rootScope.allNotify = []



  $rootScope.logout = function() {
    $rootScope.user = "";
    $localStorage.user = "";
    Notification.success("Logout successfully");
    $rootScope.numberNotify = 0
    $rootScope.allNotify = []
    $state.go("login");
  };

  $rootScope.getNotify = function(){
    $http({
      method: 'POST',
      url: path + "getNotify",
      data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name,}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          //Notification.success(res.data.message)
          $rootScope.numberNotify = res.data.notify.length
          $rootScope.allNotify = res.data.notify
        }
        else{
          if (res.data.message == 'Failed to authenticate token.'){
            Notification.error("Sorry your session is expired, Re-Login please.");
            $rootScope.logout()
          }else{
            Notification.error(res.data.message);
            }
          }

      },
      function(err) {
        Notification.error("Error!");
      }
    );
  }
  $rootScope.myQuestion = function(){
    $state.go('questionPage',{name: $rootScope.user.name, image: $rootScope.user.profileImage, platform: $rootScope.user.platform})
  }

  $rootScope.removeNotify = function(thisObje){
    $http({
      method: 'POST',
      url: path + "removeNotify",
      data: $.param({ token: $rootScope.user.token, idNotify: thisObje.notify._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          $rootScope.getNotify()
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );
  }

  $rootScope.goToPage = function(thisObje){
    console.log(thisObje)
    if (thisObje.notify.idUserMitt != "None" && thisObje.notify.idUserMitt != "Balance"){
      $state.go('singleQuestionPage', {idQuestion: thisObje.notify.idUserMitt}, {reload: true})
      //$rootScope.removeNotify(thisObje)
    }
    else if((thisObje.notify.idUserMitt == "Balance")){
      $state.go('balance') //DA METETRE SU BALANCE
    }
  }



  $window.onbeforeunload = function (e) {
      var confirmation = {};
      var event = $rootScope.$broadcast('onBeforeUnload', confirmation);
      if (event.defaultPrevented) {
          return confirmation.message;
      }
    };
  setInterval(function(){
    if ($rootScope.user && ($rootScope.user != "" || $rootScope.user != null))
      $rootScope.getNotify()
  }, 10000)
 // handle the exit event
 if ($rootScope.user && ($rootScope.user != "" || $rootScope.user != null))
  $rootScope.getNotify()



});
