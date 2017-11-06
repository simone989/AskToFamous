app.controller('homeController', function ($scope, $rootScope,$http, $localStorage, Notification) {

  $(function() {
    $('#commits').githubInfoWidget({ user: 'simone989', repo: 'AskToFamous', branch: 'master', last: 5, limitMessageTo: 60 });
    setInterval(function(){
      if ($rootScope.user.creator && $rootScope.user.creator==true ){
        $http({
          method: 'POST',
          url: path + "getBalanceNew",
          data: $.param({ name: $rootScope.user.name, token: $rootScope.user.token }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(
          function(res) {
            if (res.data.success) {
              //Notification.success(res.data.message)
              console.log(res.data.balance)
              if ($localStorage.user.balance != res.data.balance){
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
    }, 10000)

  });

});

app.controller('chartsUserController',function($scope,$rootScope, $state, $http, $stateParams, $localStorage, Notification){
  $(function(){
    $scope.nameCreator = $stateParams.nameCreator
    $http({
      method: 'POST',
      url: path + "getChartDataUser",
      data: $.param({ name: $scope.nameCreator}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          //Notification.success(res.data.message)
          $scope.series = ['Question'];
          $scope.labels = res.data.data.map(question => question.date.split(" ")[0]).filter((elem,index,self ) => index == self.indexOf(elem))
          $scope.data = [ [] ]
          for( date in res.data.data.map(question => question.date.split(" ")[0]).filter((elem,index,self ) => index == self.indexOf(elem)) ){
            $scope.data[0].push(res.data.data.map((question) => question.date.split(" ")[0]).filter((dateFilter) => dateFilter ==  res.data.data.map(question => question.date.split(" ")[0]).filter((elem,index,self ) => index == self.indexOf(elem))[date] ).length)
          }
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );


    $http({
      method: 'POST',
      url: path + "getChartDataUserTag",
      data: $.param({ name: $scope.nameCreator}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          //Notification.success(res.data.message)
          $scope.series2 = ['Tag'];
          $scope.labels2 = res.data.data.filter((elem,index,self ) => index == self.indexOf(elem))
          $scope.data2 = [ [] ]
          for(tag in res.data.data.filter((elem,index,self ) => index == self.indexOf(elem))){
            var count = 0;
            for (tagOld in  res.data.data){
              if (res.data.data[tagOld] == res.data.data.filter((elem,index,self ) => index == self.indexOf(elem))[tag]){
                count++;
              }
            }
            $scope.data2[0].push(count)
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
})

app.controller('balanceController',function($scope,$rootScope,$state, $http, $localStorage, Notification){
  $(function(){
      $http({
        method: 'POST',
        url: path + "getListBalance",
        data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name}),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(
        function(res) {
          if (res.data.success) {
            //Notification.success(res.data.message)
            $scope.balances= res.data.balance
            $scope.valueBalance = 0
            for (balance in res.data.balance){
              $scope.valueBalance+= res.data.balance[balance].value
            }
            $scope.valueBalanceChange = $scope.valueBalance
          }
          else
            Notification.error(res.data.message);
        },
        function(err) {
          Notification.error("Error!");
        }
      );

      $http({
        method: 'POST',
        url: path + "getListTransaction",
        data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name}),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(
        function(res) {
          if (res.data.success) {
            //Notification.success(res.data.message)
            $scope.allTransactions= res.data.balance
          }
          else
            Notification.error(res.data.message);
        },
        function(err) {
          Notification.error("Error!");
        }
      );

    })

  $scope.changePage = function(thisObje){
    console.log(thisObje)
    $state.go('singleQuestionPage', {idQuestion: thisObje.balance.actionId}, {reload: true})
  }

  $scope.changeValue = function(valueWithdraw){
    if (valueWithdraw == 0 || valueWithdraw == null){
      $scope.valueBalanceChange = $scope.valueBalance
      return
    }
    console.log(valueWithdraw)
    $scope.valueBalanceChange = $scope.valueBalance - valueWithdraw
  }

  $scope.withdrawFunction = function(valueWithdraw){
    if (valueWithdraw > $scope.valueBalance){
        Notification.error("Value Withdraw error");
        return
    }

    $http({
      method: 'POST',
      url: path + "withdrawBalance",
      data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name, valueWithdraw: valueWithdraw}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message)
          $state.reload()

        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );
  }
})



app.controller('singleQuestionPageController',function($scope, $rootScope, $state, $stateParams, $http, $localStorage, Notification){
  $(function(){
    $scope.allComment= {}
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

    $http({
      method: 'POST',
      url: path + "listComment",
      data: $.param({ idQuestion: $scope.idQuestion}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          $scope.allComment[$scope.idQuestion] = res.data.data
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );

  })

  $scope.openComment = function(thisObje){
    $http({
      method: 'POST',
      url: path + "listComment",
      data: $.param({ idQuestion: thisObje.question._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          $scope.allComment[thisObje.question._id] = res.data.data
          if($("#"+thisObje.question._id+"DIV")[0].hidden == false)
            $("#"+thisObje.question._id+"DIV")[0].hidden = true
          else
            $("#"+thisObje.question._id+"DIV")[0].hidden = false

        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );

  }

  $scope.sendLike = function(thisObje){
    console.log(thisObje)

    $http({
      method: 'POST',
      url: path + "sendLike",
      data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name, idQuestion: thisObje.$parent.question._id, idComment: thisObje.comment._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
            Notification.success(res.data.message)
            thisObje.comment= res.data.data
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

  $scope.sendUnLike = function(thisObje){
    console.log(thisObje)

    $http({
      method: 'POST',
      url: path + "sendUnLike",
      data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name, idQuestion: thisObje.$parent.question._id, idComment: thisObje.comment._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
            Notification.success(res.data.message)
            thisObje.comment= res.data.data
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

  $scope.replyComment = function(thisObje,commentModel){
    if(!(commentModel)){
      Notification.error("Please set all fields");
      return
    }
    $http({
      method: 'POST',
      url: path + "sendComment",
      data: $.param({ token: $rootScope.user.token, "text": commentModel, author: $rootScope.user.name, idQuestion: thisObje.question._id, creator: thisObje.question.creator  }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message)
          $state.reload();
          //$state.go('home')
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
    $scope.allComment = {}
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
          $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
          $scope.series = ['Series A', 'Series B'];

          $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
          ];
        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );

  })

  $scope.openComment = function(thisObje){
    $http({
      method: 'POST',
      url: path + "listComment",
      data: $.param({ idQuestion: thisObje.question._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          $scope.allComment[thisObje.question._id] = res.data.data
          if($("#"+thisObje.question._id+"DIV")[0].hidden == false)
            $("#"+thisObje.question._id+"DIV")[0].hidden = true
          else
            $("#"+thisObje.question._id+"DIV")[0].hidden = false

        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );

  }

  $scope.sendLike = function(thisObje){
    console.log(thisObje)

    $http({
      method: 'POST',
      url: path + "sendLike",
      data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name, idQuestion: thisObje.$parent.question._id, idComment: thisObje.comment._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
            Notification.success(res.data.message)
            thisObje.comment= res.data.data
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

  $scope.sendUnLike = function(thisObje){
    console.log(thisObje)

    $http({
      method: 'POST',
      url: path + "sendUnLike",
      data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name, idQuestion: thisObje.$parent.question._id, idComment: thisObje.comment._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
            Notification.success(res.data.message)
            thisObje.comment= res.data.data
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

  $scope.replyComment = function(thisObje,commentModel){
    if(!(commentModel)){
      Notification.error("Please set all fields");
      return
    }
    $http({
      method: 'POST',
      url: path + "sendComment",
      data: $.param({ token: $rootScope.user.token, "text": commentModel, author: $rootScope.user.name, idQuestion: thisObje.question._id, creator: thisObje.question.creator  }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message)
          $state.reload();
          //$state.go('home')
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

  $scope.changePageChart = function(thisObje){
    $state.go('chartsUser',{nameCreator: thisObje.nameCreator})
  }


});

app.controller('allQuestionController',function($scope, $rootScope, $state, $http, $localStorage, Notification){

  $(function(){
    $scope.allComment= {}
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

  $scope.openComment = function(thisObje){
    $http({
      method: 'POST',
      url: path + "listComment",
      data: $.param({ idQuestion: thisObje.question._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          $scope.allComment[thisObje.question._id] = res.data.data
          if($("#"+thisObje.question._id+"DIV")[0].hidden == false)
            $("#"+thisObje.question._id+"DIV")[0].hidden = true
          else
            $("#"+thisObje.question._id+"DIV")[0].hidden = false

        }
        else
          Notification.error(res.data.message);
      },
      function(err) {
        Notification.error("Error!");
      }
    );

  }

  $scope.sendLike = function(thisObje){
    console.log(thisObje)

    $http({
      method: 'POST',
      url: path + "sendLike",
      data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name, idQuestion: thisObje.$parent.question._id, idComment: thisObje.comment._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
            Notification.success(res.data.message)
            thisObje.comment= res.data.data
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

  $scope.sendUnLike = function(thisObje){
    console.log(thisObje)

    $http({
      method: 'POST',
      url: path + "sendUnLike",
      data: $.param({ token: $rootScope.user.token, name: $rootScope.user.name, idQuestion: thisObje.$parent.question._id, idComment: thisObje.comment._id}),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
            Notification.success(res.data.message)
            thisObje.comment= res.data.data
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

  $scope.replyComment = function(thisObje,commentModel){
    if(!(commentModel)){
      Notification.error("Please set all fields");
      return
    }
    $http({
      method: 'POST',
      url: path + "sendComment",
      data: $.param({ token: $rootScope.user.token, "text": commentModel, author: $rootScope.user.name, idQuestion: thisObje.question._id, creator: thisObje.question.creator  }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      function(res) {
        if (res.data.success) {
          Notification.success(res.data.message)
          $state.reload();
          //$state.go('home')
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
    console.log(this)
    $state.go('questionPage',{name: thisObje.question.creatorData.name, image: thisObje.question.creatorData.image, platform: thisObje.question.creatorData.platform })
  }
});

app.controller('createQuestionController',function($scope, $rootScope, $stateParams, $state, $http, JSTagsCollection,$localStorage, Notification){
  $(function(){
    $scope.nameCreator = $stateParams.name
    $scope.imageCreator = $stateParams.image
    $scope.platformCreator = $stateParams.platform
    $scope.user = $rootScope.user
    $scope.hashtagSend = []

  })

  $scope.sendQuestion= function(){
    if(!($scope.title && $scope.text && $('input[name=commentR]:checked').val())){
      Notification.error("Please set all fields");
      return
    }



    for( tag in $scope.tagsInput.tags){
      $scope.hashtagSend.push($scope.tagsInput.tags[tag].value)
    }

    if ($scope.hashtagSend.length == 0){
        Notification.error("Please set the tags");
        return
    }

    $http({
      method: 'POST',
      url: path + "sendQuestion",
      data: $.param({token: $rootScope.user.token,  name: $scope.nameCreator, user: $rootScope.user.name, title: $scope.title, text: $scope.text, tag: $scope.hashtagSend, comment: $('input[name=commentR]:checked').val(), image: $scope.imageCreator, platform: $scope.platformCreator }),
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

 $scope.tagsInput = new JSTagsCollection([]);
  $scope.jsTagOptions = {
    "tags": $scope.tagsInput,
    "texts": {
      "inputPlaceHolder": "Add your tag"
    }
  };



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

app.controller('profileController',function($scope,$rootScope, $http, $state, Notification){
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
