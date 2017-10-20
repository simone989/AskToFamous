var express = require('express');
var router = express.Router();
var User   = require('../app/models/User'); // get our mongoose models
var Question   = require('../app/models/Question'); // get our mongoose models
var Notify = require('../app/models/Notify');
var jwt = require('jsonwebtoken');
var config = require('../config')
var nodemailer  = require('nodemailer');
var fs = require('fs');
/* GET home page. */
router.get('/', function(req, res) {
  res.send("test ciao")
  //res.render('index', { title: 'Expresssss' });
});


router.post('/editUser', function(req, res, next){
  console.log(req.body.name+" "+req.body.address +"  "+req.body.gender+"  "+req.body.number+"  "+req.body.token);
  if(!req.body.name || !req.body.address || !req.body.gender || !req.body.number || !req.body.token )
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  jwt.verify(req.body.token, config.secret, function(err, decoded) {

    if (err) {
      res.json({
        success: false,
        message: 'Failed to authenticate token.'
      });
    } else {
      req['decoded'] = {}
      req['decoded']['_id'] = decoded['$__']['_id']
      //if (decoded['$__'])
      // if everything is good, save to request for use in other routes
      next();
    }
  });
},function(req,res, next){
    User.find({name: req.body.name, _id: req['decoded']['_id']}, function(err, users){
      if(err)
        throw(err);
      if(!(users[0])){
        return res.json({
          success: false,
          message: "This username not exist"
        });
      }
      else{
        next();
      }
    });
  },function(req, res, next){
    User.update({"name": req.body.name}, {"$set": {"address": req.body.address, "gender": req.body.gender, "number": req.body.number, "platform": req.body.platform ? req.body.platform : "None"}}, function(err){
      if(err)
        throw(err);
        return res.json({
          success: true,
          message: "All data as change"
        })

    });
});

router.post('/editPassword', function(req, res, next){
  console.log(req.body.name+" "+req.body.oldPassword +"  "+req.body.newPassword);
  if(!req.body.name || !req.body.oldPassword || !req.body.newPassword ||!req.body.token)
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  jwt.verify(req.body.token, config.secret, function(err, decoded) {

    if (err) {
      res.json({
        success: false,
        message: 'Failed to authenticate token.'
      });
    } else {
      req['decoded'] = {}
      req['decoded']['_id'] = decoded['$__']['_id']
      //if (decoded['$__'])
      // if everything is good, save to request for use in other routes
      next();
    }
  });
},function(req,res, next){
    User.find({name: req.body.name, _id:req['decoded']['_id']}, function(err, users){
      if(err)
        throw(err);
      if(!(users[0])){
        return res.json({
          success: false,
          message: "This username not exist"
        });
      }
      else{
        next();
      }
    });
  },function(req,res, next){
      User.find({name: req.body.name}, function(err, users){
        if(err)
          throw(err);
        if(users[0].password != req.body.oldPassword){
          return res.json({
            success: false,
            message: "Old Password is not corrent."
          });
        }
        else{
          next();
        }
      });
    },function(req, res, next){
    User.update({"name": req.body.name}, {"$set": {"password": req.body.newPassword}}, function(err, nick){
      if(err)
        throw(err);
        return res.json({
          success: true,
          message: "Password Change"
        })

    });
});

router.post('/register', function(req, res, next){
  console.log(req.body.name +"  "+req.body.password+"  "+req.body.email);
  if(!req.body.name || !req.body.password || !req.body.email)
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res, next){
    User.find({email: req.body.email}, function(err, users){
      if(err)
        throw(err);
      if(users[0]){
        return res.json({
          success: false,
          message: "this email is already registered"
        });
      }
      else{
        next();
      }
    });
  },function(req, res, next){
        User.find({name: req.body.name}, function(err, users) {
          if(err)
            throw(err);
          if(users[0])
            return res.json({
              success: false,
              message: "This username already exist."
            });
          else{
            next();
          }
        });
    },function(req, res, next){
      var nick = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        blocked: true,
        admin: true,
        number: "None",
        address: "None",
        gender: "None",
        creator: req.body.creator ? true : false,
        platform: "None",
        profileImage: "None",
        balance: 0.0,

      });

      // save the sample user
      nick.save(function(err) {
        if (err) throw err;
        res.json({
          success: true,
          message: "User registered successfully!"
        })
        console.log('User saved successfully');
      });

      var id = nick._id;


      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email,
          pass: config.password
        }
      });

      var verify = config.home_path+ '/verify?token=' +id;
      var mailOptions = {
        from: config.email,
        to: nick.email,
        subject: 'Verify your Ask to Famous',
        text: verify
      };

      transporter.sendMail(mailOptions, function(err, info){
        if(err){
          console.log("Invalid Email.");
          res.json({
            success: false,
            message: "Invalid Email."
          })
        }
        else {
          console.log('Message sent: ' +info.response);
          res.json({
            success: true,
            message: "Email di conferma inviata con successo!"
          });
        };
      });

    }
);



router.get('/verify', function(req,res){
  var id_token = req.query.token;
  console.log(id_token);
  User.update({"_id": id_token}, {"$set": {"blocked": false}}, function(err){
    if(err)
      throw(err);
      User.find({_id: id_token}, function(err, nick) {
        if(err)
          throw(err);
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: config.email,
              pass: config.password
            }
          });

          var mailOptions = {
            from: config.email,
            to: nick[0].email,
            subject: 'Confirm Verify your Ask to Famous account!',
            text: 'Dear, '+nick[0].name+', your account as be verify.'
          };

          transporter.sendMail(mailOptions, function(err, info){
            if(err){
              console.log("Invalid Email.");
            }
            else {
              console.log('Message sent: ' +info.response);
              res.writeHead(301,
                {Location: config.home_path+'/#!/login'},
                "User verified."
              );
              res.end();
            };
          });
          var notify = new Notify({
            idUser: id_token,
            textNotify: "Congratulation, your account as been verify!",
            date: new Date().toLocaleString(),
            look: false,
            idUserMitt: "None"
          });

          notify.save(function(err) {
            if (err) throw err;
            console.log("ok salvata")
          });
      });
  });



});




router.post('/authenticate', function(req, res) {

  console.log(req.body.name);
  User.findOne({
    "name": req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    }
    else if(user.blocked){
      res.json({
        success: false,
        message: 'You have to verify your account first.'
      });
    }
    else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      }
      else {

        // if user is found and password is right
        // create a token
        console.log(config.secret)
        console.log(user)
        var token = jwt.sign(user, config.secret, {
          expiresIn: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token,
          number: user.number,
          address: user.address,
          email: user.email,
          gender: user.gender,
          creator: user.creator,
          id: user._id,
          platform: user.platform,
          profileImage: user.profileImage,
          balance: user.balance
        });
      }

    }

  });
});


router.post('/upload',function(req,res,next){
  console.log(req.query)
  if (!req.files){
      res.json({
        success: false,
        message: 'No file send',
      });
    }else{
      next()
    }
  },function(req,res,next){
    jwt.verify(req.query.token, config.secret, function(err, decoded) {

      if (err) {
        res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        req['decoded'] = {}
        req['decoded']['_id'] = decoded['$__']['_id']
        //if (decoded['$__'])
        // if everything is good, save to request for use in other routes
        next();
      }
    });
  },function(req,res,next){
    User.find({"name": req.query.name, "_id":req['decoded']['_id']}, function(err, users){
      if(err)
        throw(err);
      if(!users){
        return res.json({
          success: false,
          message: "No User Found"
        });
      }
      else{

        next();
      }
    });
  },function(req,res,next){
    User.findOne({"name": req.query.name}, function(err, users){
      if(err)
        throw(err);
        if (users.profileImage == "None"){
          var randomString = Math.random().toString(36).substring(7)+'.'+req.files.file['name'].split('.')[1]
          req.files.file.mv('./public/images/profile/'+randomString)
          User.update({"name": req.query.name}, {"$set": {"profileImage": randomString}}, function(err, nick){
            if(err)
              throw(err);

              return res.json({
                success: true,
                message: "Image Upload",
                path: randomString
              })

          });
        }
      else{
        next();
      }
    });
  },function(req,res){
    User.findOne({"name": req.query.name}, function(err, users){
      if(err)
        throw(err);
          console.log(users.profileImage)
          fs.unlink('./public/images/profile/'+users.profileImage)
          var randomString = Math.random().toString(36).substring(7)+'.'+req.files.file['name'].split('.')[1]
          req.files.file.mv('./public/images/profile/'+randomString)
          User.update({"name": req.query.name}, {"$set": {"profileImage": randomString}}, function(err){
            if(err)
              throw(err);
              return res.json({
                success: true,
                message: "Image Upload",
                path: randomString
              })

          });

    });

  })

router.post('/listUser',function(req,res,next){
  if(!req.body.nameFind)
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  let resultData = []
  User.find({"creator": true},function(err,user){
    if(err)
      throw(err);
    for (Creator in user){
      //console.log(user[Creator].name)
      if (user[Creator].name.includes(req.body.nameFind)){
        var send= {name: user[Creator].name, image: user[Creator].profileImage, platform: user[Creator].platform}
        resultData.push(send)
      }
    }
    res.json({
      success: true,
      message: "Found element",
      data: resultData
    })
  })

});


router.post('/sendQuestion',function(req,res,next){
  if(!req.body.name || !req.body.user || !req.body.title || !req.body.text || !req.body.tag || !req.body.comment || !req.body.token )
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  jwt.verify(req.body.token, config.secret, function(err, decoded) {

    if (err) {
      res.json({
        success: false,
        message: 'Failed to authenticate token.'
      });
    } else {
      req['decoded'] = {}
      req['decoded']['_id'] = decoded['$__']['_id']
      //if (decoded['$__'])
      // if everything is good, save to request for use in other routes
      next();
    }
  });
},function(req,res,next){
  User.find({"creator": true, "name":req.body.name },function(err,user){
    if(err)
      throw(err);

    if(!user[0]){
      res.json({
        success: false,
        message: "No Creator Found"
      });
    }else {
      req.decoded.userId= user[0]["_id"]
      next();
    }
  })

},function(req,res,next){
  User.find({"name":req.body.user,"_id":req['decoded']['_id'] },function(err,user){
    if(err)
      throw(err);
    if(!user[0]){
      res.json({
        success: false,
        message: "No User Found"
      });
    }else {

      next();
    }
  })
}, function(req,res,next){
  var question = new Question({
    title: req.body.title,
    text: req.body.text,
    creator: req.body.name,
    commentFlag: req.body.comment,
    date: new Date().toLocaleString(),
    author: req.body.user,
    tag: req.body.tag,
    creatorData: {name: req.body.name, image: req.body.image, platform: req.body.platform},
    reply: "None",
    dateReply: "None"
  });

  question.save(function(err) {
    if (err) throw err;
    res.json({
      success: true,
      message: "Question Send!"
    })
  });

  var notify = new Notify({
    idUser: req.decoded.userId,
    textNotify: "Your have new question!",
    date: new Date().toLocaleString(),
    look: false,
    idUserMitt: "None"
  });
  notify.save(function(err) {
    if (err) throw err;
    console.log("ok salvata")
  });
});


router.post('/listQuestion',function(req,res,next){
  if(!req.body.name)
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  Question.find({"creator": req.body.name},function(err,questionAll){
    if(err)
      throw(err);

      res.json({
        success: true,
        message: "Found element",
        data: questionAll
      })
    })
});

router.post('/listAllQuestion', function(req,res){
  Question.find({},function(err,questionAll){
    if(err)
      throw(err);
      res.json({
        success: true,
        message: "Found element",
        data: questionAll
      })
  })
});

router.post('/sendReply',function(req,res,next){
  if(!req.body.token || !req.body.text || !req.body.name  || ! req.body.idQuestion )
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  User.find({"creator": true, "name":req.body.name },function(err,user){
    if(err)
      throw(err);
    if(!user[0]){
      res.json({
        success: false,
        message: "No Creator Found"
      });
    }else {
      next();
    }
  })

},function(req,res,next){
  jwt.verify(req.body.token, config.secret, function(err, decoded) {
    if (err) {
      res.json({ success: false, message: 'Failed to authenticate token.' });
    } else {
      // if everything is good, save to request for use in other routes
      req['decoded'] = { "_id": "","nameAuth": ""}
      req['decoded']['_id'] = decoded['$__']['_id']
      next();
    }
  });

},function(req,res,next){
  Question.find({"_id": req.body.idQuestion, "creator": req.body.name  },function(err,question){
    if(err)
      throw(err);
      if(!question[0]){
        res.json({
          success: false,
          message: "Error Authentication1."
        });
      }
    User.findOne({"_id": req['decoded']['_id'], name: question[0].creator },function(err,user){
      if(!user){

        res.json({
          success: false,
          message: "Error Authentication2."
        });
      }else {
        console.log("qui metto la var")

        req['decoded']['nameAuth'] = question[0].author
        next();
      }
    })
  })
},function(req,res,next){
  Question.update({"_id": req.body.idQuestion}, {"$set": {"reply": req.body.text, "dataReply": new Date().toLocaleString() } }, function(err,update){
    if(err)
      throw(err);
      console.log(update)
      console.log(req['decoded']['nameAuth'])
      User.findOne({"name":req['decoded']['nameAuth'] },function(err,user){
        if(err)
          throw(err);
          //notify for user
          console.log(user)
          var notify = new Notify({
            idUser: user['_id'],
            textNotify: "Congratulation, your creator reply to you!",
            date: new Date().toLocaleString(),
            look: false,
            idUserMitt: req['decoded']['_id']
          });
          notify.save(function(err) {
            if (err) throw err;
            console.log("ok salvata")
          });

      })

      var notify = new Notify({
        idUser: req['decoded']['_id'],
        textNotify: "Congratulation, your balance as ",
        date: new Date().toLocaleString(),
        look: false,
        idUserMitt: "None"
      });
      notify.save(function(err) {
        if (err) throw err;
        console.log("ok salvata")
      });
       res.json({
        success: true,
        message: "You Reply as be send."
      })

  });
  User.update({"creator": true, "name":req.body.name},{"$inc": {"balance": 1.0}  },function(err,user){
    if(err)
      throw(err);
      console.log(user)
  })

});


router.post('/getBalance',function(req,res,next){
  if(!req.body.token ||  !req.body.name  )
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  User.find({"creator": true, "name":req.body.name },function(err,user){
    if(err)
      throw(err);
    if(!user[0]){
      res.json({
        success: false,
        message: "No Creator Found"
      });
    }else {
      next();
    }
  })

},function(req,res,next){
  jwt.verify(req.body.token, config.secret, function(err, decoded) {

    if (err) {
      res.json({
        success: false,
        message: 'Failed to authenticate token.'
      });
    } else {
      req['decoded'] = {}
      req['decoded']['_id'] = decoded['$__']['_id']
      //if (decoded['$__'])
      // if everything is good, save to request for use in other routes
      next();
    }
  });

},function(req,res,next){
  User.findOne({"creator": true, "name":req.body.name, "_id": req.decoded['_id'] },function(err,user){
    if(err)
      throw(err);
      if(user){
        res.json({
          success: true,
          message: "ok",
          balance: user.balance
        });
      }else{
        res.json({
          success: false,
          message: "You are not authenticate"
        });

      }
  })
});

router.post('/getNotify',function(req,res,next){
  if(!req.body.token || !req.body.name )
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  jwt.verify(req.body.token, config.secret, function(err, decoded) {

    if (err) {
      res.json({
        success: false,
        message: 'Failed to authenticate token.'
      });
    } else {
      req['decoded'] = {}
      req['decoded']['_id'] = decoded['$__']['_id']
      //if (decoded['$__'])
      // if everything is good, save to request for use in other routes
      next();
    }
  });
},function(req,res,next){
  Notify.find({"idUser":req['decoded']['_id'], 'look':false },function(err,user){
    if(err)
      throw(err);
      if(user[0]){
        res.json({
          success: true,
          message: "ok",
          notify: user
        });
      }else{
        res.json({
          success: true,
          message: "ok",
          notify: []
        });
      }
  })
})


router.post('/removeNotify',function(req,res,next){
  if(!req.body.token || !req.body.idNotify )
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res,next){
  jwt.verify(req.body.token, config.secret, function(err, decoded) {
    if (err) {
      res.json({
        success: false,
        message: 'Failed to authenticate token.'
      });
    } else {
      req['decoded'] = {}
      req['decoded']['_id'] = decoded['$__']['_id']
      next();
    }
  });
},function(req,res,next){
  Notify.find({"idUser":req['decoded']['_id'], '_id': req.body.idNotify },function(err,notify){
    if(err)
      throw(err);
      if(!notify[0]){
        res.json({
          success: false,
          message: "Error, no notify found",
        });
      }
      else {
        next()
      }
  })
}, function(req,res,next){
  Notify.update({"idUser":req['decoded']['_id'], '_id': req.body.idNotify },{"$set": {"look":true } },function(err,notify){
    if(err)
      throw(err);
      res.json({
        success: true,
        message: "ok",
      });
  })
})






module.exports = router;
