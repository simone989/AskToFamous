var express = require('express');
var router = express.Router();
var User   = require('../app/models/User'); // get our mongoose models
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
  console.log(req.body.name+" "+req.body.address +"  "+req.body.gender+"  "+req.body.number);
  if(!req.body.name || !req.body.address || !req.body.gender || !req.body.number)
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res, next){
    User.find({name: req.body.name}, function(err, users){
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
  if(!req.body.name || !req.body.oldPassword || !req.body.newPassword)
    res.json({
      success: false,
      message: "You've to fill all the fields."
    });
  else
    next();
},function(req,res, next){
    User.find({name: req.body.name}, function(err, users){
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
        profileImage: "None"

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
          profileImage: user.profileImage
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
    User.find({ "name": req.query.name}, function(err, users){
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

/*
router.post('/upload',function(req,res, next){

  if(req.files){
    var randomString = Math.random().toString(36).substring(7)+'.'+req.files.file['name'].split('.')[1]
    req.files.file.mv('./public/images/profile/'+randomString)
    if( req.files.oldPhoto == "None"){
      User.update({"name": req.body.name}, {"$set": {"password": req.body.newPassword}}, function(err, nick){
        if(err)
          throw(err);
          return res.json({
            success: true,
            message: "Password Change"
          })

      });
    }
    //req.files.sampleFile.name = req.files.sampleFile.name
    //console.log(req.files[0].name)

  }
  res.send("ok")
});

*/


module.exports = router;
