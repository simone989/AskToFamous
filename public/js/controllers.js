app.controller('homeController', function ($scope, $rootScope,$http, $localStorage, Notification) {

  $(function() {
    $('#commits').githubInfoWidget({ user: 'simone989', repo: 'AskToFamous', branch: 'master', last: 5, limitMessageTo: 60 });
    setInterval(function(){
      if ($rootScope.user){
        $http({
          method: 'POST',
          url: path + "getBalance",
          data: $.param({ name: $rootScope.user.name, token: $rootScope.user.token }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(
          function(res) {
            if (res.data.success) {
              //Notification.success(res.data.message)
              if ($localStorage.user.balance !== res.data.balance){
                $localStorage.user.balance = res.data.balance
              }

            }
            else{
              if (res.data.message == 'Failed to authenticate token.'){
                Notification.error("Sorry your session is expired, Re-Login please.");
                $rootScope.logout()
              }else
                Notification.error(res.data.message);
            }
          },
          function(err) {
            Notification.error("Error!");
          }
        );
      }
    }, 60000)



  });

});



app.controller('singleQuestionPageController',function($scope, $rootScope, $state, $stateParams, $http, $localStorage, Notification){
  $(function(){
    console.log("QUIII")
    $scope.idQuestion = $stateParams.idQuestion
    $http({
      method: 'POST',
      url: path + "listAllQuestion",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        console.log("entra quii")
        $scope.allQuestion= []
        if (res.data.success) {
          //Notification.success(res.data.message)
          for( question in res.data.data){
            if(res.data.data[question]['_id'] == $scope.idQuestion){
              $scope.allQuestion.push(res.data.data[question])
            }
          }
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );

  })

  $scope.replyQuestion = function(thisObje,replyModel){
    if(!(replyModel)){
      Notification.error("Please set all fields");
      return
    }
    console.log($rootScope)
    console.log($scope.reply)

    $http({
      method: 'POST',
      url: path + "sendReply",
      data: $.param({ token: $rootScope.user.token, "text": replyModel, name: thisObje.question.creatorData.name, idQuestion: thisObje.question._id }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message)
          Notification.success("Congratu hai aumentato il tuo bilancio.")
          $state.reload();
          //$state.go('home')
          console.log($rootScope.user)
          //$state.go('questionPage',{name: $rootScope.user.name, image: $rootScope.user.profileImage, platform: $rootScope.user.platform })
        }
        else{
          if (res.data.message == 'Failed to authenticate token.'){
            Notification.error("Sorry your session is expired, Re-Login please.");
            $rootScope.logout()
          }else
            Notification.error(res.data.message);
        }
      },
      function(err) {
        Notification.error("Error!");
      }
    );


  }

  $scope.changePage = function(thisObje){
    $state.go('createQuestion',{name: thisObje.nameCreator,image: thisObje.imageCreator, platform: thisObje.platformCreator})
  }

});


app.controller('questionPageController',function($scope, $rootScope, $state, $stateParams, $http, $localStorage, Notification){
  $(function(){
    $scope.nameCreator = $stateParams.name
    $scope.imageCreator = $stateParams.image
    $scope.platformCreator = $stateParams.platform
    $http({
      method: 'POST',
      url: path + "listQuestion",
      data: $.param({ name: $scope.nameCreator  }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          //Notification.success(res.data.message)
          $scope.allQuestion = res.data.data
          console.log(res.data.data)
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );

  })

  $scope.replyQuestion = function(thisObje,replyModel){
    if(!(replyModel)){
      Notification.error("Please set all fields");
      return
    }
    console.log($rootScope)
    console.log($scope.reply)

    $http({
      method: 'POST',
      url: path + "sendReply",
      data: $.param({ token: $rootScope.user.token, "text": replyModel, name: thisObje.question.creatorData.name, idQuestion: thisObje.question._id }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message)
          Notification.success("Congratu hai aumentato il tuo bilancio.")
          $state.reload();
          //$state.go('home')
          console.log($rootScope.user)
          //$state.go('questionPage',{name: $rootScope.user.name, image: $rootScope.user.profileImage, platform: $rootScope.user.platform })
        }
        else{
          if (res.data.message == 'Failed to authenticate token.'){
            Notification.error("Sorry your session is expired, Re-Login please.");
            $rootScope.logout()
          }else
            Notification.error(res.data.message);
        }
      },
      function(err) {
        Notification.error("Error!");
      }
    );


  }

  $scope.changePage = function(thisObje){
    $state.go('createQuestion',{name: thisObje.nameCreator,image: thisObje.imageCreator, platform: thisObje.platformCreator})
  }

});

app.controller('allQuestionController',function($scope, $rootScope, $state, $http, $localStorage, Notification){

  $(function(){
    $http({
      method: 'POST',
      url: path + "listAllQuestion",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          //Notification.success(res.data.message)
          $scope.allQuestion = res.data.data
          console.log(res.data.data)
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );
  });

  $scope.changePage = function(thisObje){
    console.log(this)
    $state.go('questionPage',{name: thisObje.question.creatorData.name, image: thisObje.question.creatorData.image, platform: thisObje.question.creatorData.platform })
  }
});

app.controller('createQuestionController',function($scope, $rootScope, $stateParams, $state, $http, $localStorage, Notification){
  $(function(){
    $scope.nameCreator = $stateParams.name
    $scope.imageCreator = $stateParams.image
    $scope.platformCreator = $stateParams.platform
    $scope.user = $rootScope.user
  })

  $scope.sendQuestion= function(){
    if(!($scope.title && $scope.text && $scope.tag && $('input[name=commentR]:checked').val())){
      Notification.error("Please set all fields");
      return
    }


    $http({
      method: 'POST',
      url: path + "sendQuestion",
      data: $.param({token: $rootScope.user.token,  name: $scope.nameCreator, user: $rootScope.user.name, title: $scope.title, text: $scope.text, tag: $scope.tag.split("#"), comment: $('input[name=commentR]:checked').val(), image: $scope.imageCreator, platform: $scope.platformCreator }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
            Notification.success(res.data.message)
            $state.go('questionPage',{name: $scope.nameCreator, image:$scope.imageCreator , platform: $scope.platformCreator })
        }
        else
        {
            Notification.error(res.data.message);
        }
      },
      function(err) {
        Notification.error("Error!");
      }
    );


  }
});
app.controller('findController',function($scope, $rootScope, $state, $http, $localStorage, Notification){


  $scope.changePage = function(thisObje){
    $state.go('questionPage',{name: thisObje.creator.name, image: thisObje.creator.image, platform: thisObje.creator.platform})
  }

  $scope.changeName = function(){
    if ($scope.nameFind == ""){
        $scope.AllCreator = []
        return
    }
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
          $localStorage.user = { token : res.data.token, name : $scope.username, number: res.data.number,  address: res.data.address, email: res.data.email, gender: res.data.gender, creator: res.data.creator, id: res.data.id, platform: res.data.platform, profileImage: res.data.profileImage, balance: res.data.balance };
          $rootScope.user = $localStorage.user;
          $state.go("home");
          Notification.success("Logged successfully");
          $rootScope.getNotify()
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
      data: $.param({ token: $rootScope.user.token, name: $scope.user.name, address: $scope.address ? $scope.address : "None" , number: $scope.number ? $scope.number : "None" , gender: $scope.gender ? $scope.gender : "None" }),
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
          console.log(thisObje)
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
      data: $.param({token: $rootScope.user.token, name: $scope.user.name, oldPassword: $scope.oldPassword , newPassword: $scope.newPassword}),
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


app.controller('profileControllerCreator',function($scope, $http,$rootScope, $state, Upload,$timeout,Notification){
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
      data: $.param({ token: $rootScope.user.token, name: $scope.user.name, address: $scope.address ? $scope.address : "None" , number: $scope.number ? $scope.number : "None" , gender: $scope.gender ? $scope.gender : "None", platform: $scope.platform ? $scope.platform : "None" }),
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
      data: $.param({token: $rootScope.user.token, name: $scope.user.name, oldPassword: $scope.oldPassword , newPassword: $scope.newPassword}),
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
            params: {token: $rootScope.user.token, oldPhoto: $scope.user.profileImage, name: $scope.user.name},
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
