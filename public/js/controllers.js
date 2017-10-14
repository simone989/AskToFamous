app.controller('homeController', function ($scope) {

  $(function() {
    $('#commits').githubInfoWidget({ user: 'simone989', repo: 'AskToFamous', branch: 'master', last: 5, limitMessageTo: 60 });
  });

});

app.controller('loginController', function ($scope, $rootScope, $state, $http, $localStorage, Notification) {

  // check if user is already logged
  if ($rootScope.user != null && $rootScope.user.token != "") {
    $rootScope.user = null;
    $localStorage.user = null;
  }

  $scope.loginUser = function() {

    $http({
      method: 'POST',
      url: path + "authenticate",
      data: $.param({ name: $scope.username, password: $scope.password }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          $localStorage.user = { token : res.data.token, name : $scope.username, number: res.data.number, birth: res.data.birth , address: res.data.address, email: res.data.email, gender: res.data.gender };
          $rootScope.user = $localStorage.user;
          $state.go("home");
          Notification.success("Logged successfully");
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );

  };
});

app.controller('registerController', function ($scope, $http, $state, Notification) {

  $scope.alertMessage = "";

  $scope.registerUser = function() {

    $http({
      method: 'POST',
      url: path + "register",
      data: $.param({ email: $scope.email , name: $scope.username, password: $scope.password }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message);
          $scope.alertMessage = res.data.message;
          $state.go("home");
        }
        else {
          Notification.error(res.data.message);
          $scope.alertMessage = res.data.message;
        }
      },
      function(err) {
        Notification.error("Error!");
        $scope.alertMessage = "Registered successfully! Check email!";
      }
    );

  };

});


app.controller('profileController',function($scope, $http, $state, Notification){
  $(function(){
    if($scope.user){
      if($scope.user.address != "None"){
        $('#addressS').val($scope.user.address)
        $scope.address = $scope.user.address
      }
      if($scope.user.number != "None"){
        $('#numberS').val($scope.user.number)
        $scope.number = $scope.user.number
      }
      if($scope.user.gender != "None"){
        $('#genderS').val($scope.user.gender)
        $scope.gender = $scope.user.gender
      }
    }


  })
  $scope.alertMessage = "";
  $scope.name = "test";

  $scope.editUser = function() {
    $http({
      method: 'POST',
      url: path + "editUser",
      data: $.param({name: $scope.user.name, address: $scope.address ? $scope.address : "None" , number: $scope.number ? $scope.number : "None" , gender: $scope.gender ? $scope.gender : "None" }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message);
          $scope.alertMessage = res.data.message;
          //$state.go("home");
        }
        else {
          Notification.error(res.data.message);
          $scope.alertMessage = res.data.message;
        }
      },
      function(err) {
        Notification.error("Error!");
        //$scope.alertMessage = "Registered successfully! Check email!";
      }
    );


    //$state.go("home");


  };

  $scope.editPassword = function() {
    if (!($scope.oldPassword)){
      Notification.error("Please, insert a old password");
      return
    }

    if (!($scope.newPassword && $scope.replyNewPassword && ($scope.newPassword == $scope.replyNewPassword) ) ){
        Notification.error("New Password and Confirm password is not corrent");
        return
        //$scope.alertMessage = res.data.message;
    }

    $http({
      method: 'POST',
      url: path + "editPassword",
      data: $.param({name: $scope.user.name, oldPassword: $scope.oldPassword , newPassword: $scope.newPassword}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message);
          $scope.alertMessage = res.data.message;
          $scope.oldPassword = ""
          $scope.newPassword = ""
          $scope.replyNewPassword = ""
          //$state.go("home");
        }
        else {
          Notification.error(res.data.message);
          $scope.alertMessage = res.data.message;
        }
      },
      function(err) {
        Notification.error("Error!");
        //$scope.alertMessage = "Registered successfully! Check email!";
      }
    );

    //$state.go("home");


  };



})
