var express = require('express');
var router = express();
var User = require('./models/user');
var Album = require('./models/album');
var fs = require("fs");
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var urlEncodedParser = bodyParser.urlencoded({ extended: true });
var bcrypt = require('bcrypt');
var upload = multer({ dest: 'uploads/'});
router.set('view engine', 'pug');

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});


//POST routes for updating data

//...........S I G N  U P  R E Q U E S T................

router.post('/signup', function (req, res, next) {

 if (req.body.email &&
    req.body.username &&
    req.body.password && 
    req.body.f && 
    req.body.l &&
    req.body.gender ) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      gender: req.body.gender,
      firstname: req.body.f,
      lastname: req.body.l,
      encrypted: 0
    }

    
    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        console.log("User Created!")
        return res.redirect('/profile');
      }
    });

  } 
})

router.post('/createAlbum', upload.single('photo'), function (req, res, next) {

 if (req.body.albumName &&
    req.body.desc &&
    req.body.privacy ) {
    var albumData = {
      name: req.body.albumName,
      desc: req.body.desc,
      privacy: req.body.privacy,
      cover: req.file.filename,
    }

    var id1;
    Album.create(albumData, function (error, album) {
      if (error) {
        return next(error);
      } else {
        console.log("Album Added!");
        if( !req.file )
                return res.redirect('/gallery');
            else {
                Album.findByIdAndUpdate(album._id,
                {$push: {photos: req.file.filename}},
                {safe: true, upsert: true},
                function(err1, album1) {
                    if(err1){
                    console.log(err1);
                    } else {
                        console.log("Photo pushed!");
                        return res.redirect('/gallery');
                    }
                });
            }
        User.findByIdAndUpdate(req.session.userId,
            {$push: {albums: album}},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err){
                console.log(err);
                } else {
                    console.log("Album pushed!");
                }
            });
      }
    });

  } 
})

//........... L O G I N  R E Q U E S T................

router.post('/login', function (req, res, next) {

   if (req.body.loginID && req.body.loginPassword ) {
    User.authenticate(req.body.loginID, req.body.loginPassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong username or password.');
        err.status = 401;
        return res.redirect('/');
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// .........  E D I T  R E Q U E S T ..............

router.post('/edit', function (req, res, next) {
    

    User.findById(req.session.userId)
    .exec(function (err, user) {
      if (!user)
        return next(new Error('Could not load Document'));
      else {

        user.email = req.body.email;
        user.firstname = req.body.f; 
        user.lastname = req.body.l;
        user.gender = req.body.gender;

        user.save(function(err) {
          if (err)
            console.log('error');
          else {
            console.log('Changes saved');
            res.redirect('/profile');
        }
        });
      }
    });
})

router.post('/uploadDp', upload.single('dp'), function (req, res, next) {

    console.log(req.file);
     
    User.findById(req.session.userId)
    .exec(function (err, user) {
      if (!user)
        return next(new Error('Could not load Document'));
      else {
        
         if (!req.file)
            return res.status(400).send('No files were uploaded.');
        if( user.img != null ) {
            var oldfile = 'uploads/'+user.img; 
            fs.unlinkSync(oldfile);
        }
        user.img = req.file.filename;

        user.save(function(err) {
          if (err)
            console.log('error');
          else {
            console.log('Changes saved');
            res.redirect('/profile');
          }
        });
      }
    });
})

router.get('/:id/photo', function(req, res) {
    
    User.findById(req.session.userId)
        .exec(function (error, user) {
        if (error) {
            res.redirect('/');
        } else {
            if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 400;
                res.redirect('/');
            } else {
                res.sendFile(path.join(__dirname + '/photos.html'));

            }
        }
    });

});

router.get('/gallery', function(req, res) {

    User.findById(req.session.userId)
        .exec(function (error, user) {
          if (error) {
            res.redirect('/');
          } else {
            if (user === null) {
              var err = new Error('Not authorized! Go back!');
              err.status = 400;
              res.redirect('/');
            } else {

            res.sendFile(path.join(__dirname + '/gallery.html'));
            }
          }
        });

});

router.get('/profile', function(req, res) {

    User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        res.redirect('/');
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          res.redirect('/');
        } else {

        res.sendFile(path.join(__dirname + '/profile.html'));
        }
      }
    });
    
});


router.get('/images/:img', function(req, res) {
    var url = '/images/' + req.params.img;
    res.sendFile(path.join(__dirname + url));
});
router.get('/css/materialize.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/css/materialize.css'));
});
router.get('/css/style.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/css/style.css'));
});

router.get('/client.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/client.js'));
});
router.get('/uploads/:id', function(req, res) {
    res.sendFile(path.join(__dirname + '/uploads/'+req.params.id));
});

router.get('/listAlbums', function(req, res) {

    User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        res.redirect('/');
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          res.redirect('/');
        } else {
          res.render('AlbumList', { title: 'testing', albums: user.albums }, function(err, html) {
                res.send(html);
            });
        }
      }
    });
});

router.get('/publicAlbums', function(req, res) {


    Album.find({ 'privacy': 'public' })
    .exec(function (error, album) {
      if (error) {
        res.redirect('/');
      } else {
            console.log(album);
          res.render('publicAlbumList', { title: 'testing', albums: album }, function(err, html) {
                res.send(html);
            });
        }
      });
});

router.get('/:id/open', function(req, res) {
  
    Album.findById(req.params.id)
    .exec(function (error, album) {
      if (error) {
        res.redirect('/');
      } else {
        if (album === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          res.redirect('/');
        } else {
       
            res.render('photos', { title: 'testing', photos: album.photos }, function(err, html) {
                res.send(html);
            });

        }
      }
    });
});


router.post('/:id/uploadPhoto', upload.single('photo'), function (req, res, next) {

    console.log(req.file);
    
        
    if (!req.file)
        return res.status(400).send('No files were uploaded.');
    
    Album.findByIdAndUpdate(req.params.id,
        {$push: {photos: req.file.filename}},
        {safe: true, upsert: true},
        function(err, album) {
            if(err){
            console.log(err);
            } else {
                console.log("Photo pushed!");
                return res.redirect('/gallery');
            }
        });

})

router.get('/userDetails', function(req, res) {

    User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        res.redirect('/');
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          res.redirect('/');
        } else {
          res.render('UserDetails', { title: 'testing', user: user }, function(err, html) {
                res.send(html);
            });
        }
      }
    });
});

router.get('/profilePicture', function(req, res) {

    User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        res.redirect('/');
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          res.redirect('/');
        } else {
            
          res.render('dp', { title: 'testing', user: user }, function(err, html) {
                res.send(html);
            });

        }
      }
    });
});

router.delete('/deleteAlbum/:id', function(req, res) {

    Album.findById(req.params.id)
    .exec(function(err,album){
        if( err ) {
            console.log(err);
        } else {
            album.photos.forEach(function(value){
                console.log(value);
                var oldfile = 'uploads/'+value; 
                fs.unlinkSync(oldfile);
            });
            Album.remove({ _id: req.params.id }, function(err) {

            if (!err) {
                console.log("Album removed");
            }
            else {
                console.log(err);
            }
    });
        }
    });
  
    User.findByIdAndUpdate( req.session.userId,
    { $pull: {'albums': {_id: req.params.id }}},
    function(err, doc) {
        if(err) {
        console.log(err);
        } else {
            //console.log(doc);
            console.log("Deleted album");
            res.redirect('/gallery');
        }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/:id/logout', function (req, res, next) {
 return res.redirect('/logout');
});
router.get('/:id/profile', function (req, res, next) {
 return res.redirect('/profile');
});
router.get('/:id/gallery', function (req, res, next) {
 return res.redirect('/gallery');
});
router.get('/:id/css/materialize.css', function(req, res) {
    return res.redirect('/css/materialize.css');
});
router.get('/:id/css/style.css', function(req, res) {
    return res.redirect('/css/style.css');
});

router.get('/:id/client.js', function(req, res) {
    return res.redirect('/client.js');    
});
module.exports = router;