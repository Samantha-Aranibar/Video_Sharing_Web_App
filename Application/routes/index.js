var express = require('express');
const { getRecentPosts } = require('../middleware/post');
var router = express.Router();

/* GET home page. */
//http://localhost:3000/
router.get('/', getRecentPosts,function(req, res, next) {
  // res.render('index', { title: 'SamSam', css:['index.css'] ,js:['index.js'] });
    res.redirect('/post/viewpost');
});

//Might have to delete this later
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login', css:['login.css'] ,js:['login-validation.js']});
});

/** /register */
router.get('/registration', function(req, res, next) {
  res.render('registration', { title: 'Register', css:['registration.css'] ,js:['registration-validation.js'] });
});

/** /post */
router.get('/postvideo', function(req, res, next) {
  res.render('postvideo', { title: 'Post', css:['postvideo.css'] ,js:['postvideo.js'] });
});

router.get('/viewpost', function(req, res, next) {
  res.redirect('/post/viewpost');
});


/** /profile */
router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Profile', css:['profile.css']});
});

module.exports = router;



