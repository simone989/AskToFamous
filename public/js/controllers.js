app.controller('homeController', function ($scope) {

  $(function() {
    $('#commits').githubInfoWidget({ user: 'simone989', repo: 'AskToFamous', branch: 'master', last: 5, limitMessageTo: 60 });
  });

});


app.controller('questionPageController',function($scope, $rootScope, $state, $stateParams, $http, $localStorage, Notification){
  $(function(){
    $scope.nameCreator = $stateParams.name
    $scope.imageCreator = $stateParams.image
    $scope.platformCreator = $stateParams.platform
  })

  $scope.changePage = function(thisObje){
    console.log(thisObje)
    $state.go('createQuestion',{name: thisObje.nameCreator,})

  }

});

app.controller('allQuestionController',function($scope, $rootScope, $state, $http, $localStorage, Notification){

});

app.controller('createQuestionController',function($scope, $rootScope, $stateParams, $state, $http, $localStorage, Notification){
  $(function(){
    $scope.nameCreator = $stateParams.name
    $scope.user = $rootScope.user
  })
});
app.controller('findController',function($scope, $rootScope, $state, $http, $localStorage, Notification){


  $scope.changePage = function(thisObje){
    $state.go('questionPage',{name: thisObje.creator.name, image: thisObje.creator.image, platform: thisObje.creator.platform})
  }

  $scope.changeName = function(){
    if ($scope.nameFind == "")
      return
    $http({
      method: 'POST',
      url: path + "listUser",
      data: $.param({ nameFind: $scope.nameFind }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          $('#ContainerLi').empty()
          $scope.AllCreator = res.data.data
          /*
          for (name in res.data.data){
            //var pLink = $("<div class='pFind' ng-click=\"changePage('"+res.data.data[name]+"')\"></div>").text(res.data.data[name]);
            var pLink= "<button class='pFind' ng-click= changePage('"+res.data.data[name]+"')><a >"+res.data.data[name]+"</a></button>"
            $('#Container').append(pLink,"<br>")
          }
          */
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );
  }


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
          $localStorage.user = { token : res.data.token, name : $scope.username, number: res.data.number,  address: res.data.address, email: res.data.email, gender: res.data.gender, creator: res.data.creator, id: res.data.id, platform: res.data.platform, profileImage: res.data.profileImage };
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


app.controller('registerCreatorController', function ($scope, $http, $state, Notification) {

  $scope.alertMessage = "";

  $scope.registerUser = function() {

    $http({
      method: 'POST',
      url: path + "register",
      data: $.param({ email: $scope.email , name: $scope.username, password: $scope.password, creator: true }),
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
          $scope.user.address = $scope.address != "None" ? $scope.address : "None"
          $scope.user.number = $scope.number != "None" ? $scope.number : "None"
          $scope.user.gender = $scope.gender != "None" ? $scope.gender : "None"
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


app.controller('profileControllerCreator',function($scope, $http, $state, Upload,$timeout,Notification){
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
      if($scope.user.platform != "None"){
        $('#platformS').val($scope.user.platform)
        $scope.platform = $scope.user.platform
      }
    }


  })
  $scope.alertMessage = "";
  $scope.name = "test";

  $scope.editUser = function() {
    $http({
      method: 'POST',
      url: path + "editUser",
      data: $.param({name: $scope.user.name, address: $scope.address ? $scope.address : "None" , number: $scope.number ? $scope.number : "None" , gender: $scope.gender ? $scope.gender : "None", platform: $scope.platform ? $scope.platform : "None" }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message);
          $scope.alertMessage = res.data.message;
          $scope.user.address = $scope.address != "None" ? $scope.address : "None"
          $scope.user.number = $scope.number != "None" ? $scope.number : "None"
          $scope.user.gender = $scope.gender != "None" ? $scope.gender : "None"
          $scope.user.platform = $scope.platform != "None" ? $scope.platform : "None"
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

  $scope.uploadFiles= function (file, errFiles) {
    $scope.f = file;
    $scope.errFile = errFiles && errFiles[0];
    if (file) {
        file.upload = Upload.upload({
            url: path + "upload",
            params: { oldPhoto: $scope.user.profileImage, name: $scope.user.name},
            file: file
        });
        file.upload.then(function (response) {
            $timeout(function () {
                file.result = response.data;
                if (file.result.success) {
                  Notification.success(file.result.message);
                  $scope.user.profileImage = file.result.path;
                  //$state.go("home");
                }

            });
        });
    }
  }



})
