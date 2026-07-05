var express = require('express');
var router = express.Router();
const{doesUsernameExist, doesEmailExist, validateEmail, validatePassword, validateUsername, checkLogin, isLoggedIn, isNotLoggedIn, isMyProfile} = require('../middleware/validate');
const db = require('../conf/database');
const bcrypt = require('bcrypt');
const { getPostByUserId } = require('../middleware/post');

//////////////////// REGISTRATION ////////////////////
router.post("/registration", 
  validateUsername,
  validateEmail,
  validatePassword,
  doesUsernameExist,
  doesEmailExist,
  async function (req, res, next) {
    var {username,email,password,Cpassword} = req.body;  // Get the username, email, password, and confirm password from the request body
    try{
      const hashedPassword = await bcrypt.hash(password, 3);

      console.log("Attemping to insert: ", username,email,hashedPassword); //debbuging

      var [resultObject,_] = await db.query(`INSERT INTO user (username, email, password) VALUES (?, ?, ?);`, [username, email, hashedPassword]);
      if (resultObject && resultObject.affectedRows) {
        req.flash("success", "Registration successful! Please login.");
        return req.session.save((err) => {
          return res.redirect('/login');
        })
      } else {
        req.flash("error", "Account creation failed! Please try again.");
        return req.session.save((err) => {
          return res.redirect('/registration');
        });
      }
    }catch(err){
      next(err);
    }
});

//////////////////////////// LOGIN ////////////////////////////
router.post("/login",
  isNotLoggedIn,
  checkLogin, 
  async function (req, res, next) {
    try {
      console.log("Checking login");
      if (!req.user) {  // Ensure `checkLogin` succeeded
        console.log("1. Invalid pass");
        req.flash("error", "Invalid username or password.");
        return res.redirect('/login');
      }

      req.session.user = {
        id: req.user.user_id,
        username: req.user.username,
        email: req.user.email
      };

      req.flash("success", `Welcome back, ${req.user.username}!`);
      return req.session.save(err => {
        if (err) return next(err);
        res.redirect('/');
      });
    } catch (err) {
      next(err);
    }
  }
);

//////////////////////////// LOGOUT  ////////////////////////////
router.get(`/logout`,
isLoggedIn,
async function(req, res, next){
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    res.clearCookie('csid'); // Clear the session cookie
    res.redirect('/login'); // Redirect to the login page after logout
  });
});

//////////////////////////// LOGOUT ROUTE LIKE VIDEO ////////////////////////////
//localhost:3000/users/logout
router.post('/logout',function(req, res, next) {
  return req.session.destroy(function(err) {
    if(err) next(err);
    res.redirect('/'); // Redirect to the home page after logout
  });
});

router.get(`/login`,
isNotLoggedIn,
function(req, res, next){
  res.render("user/login", {title: "Login"});   //{{!users}}
});

//localhost:3000/users/#
router.get(`/:id(\\d+)`, isLoggedIn, isMyProfile, function (req, res, next) {
  var userId = req.params.id; // Get the user ID from the URL parameter
  res.render(`profile`);
});

// Update this route in users.js
router.get(`/:id(\\d+)`, isLoggedIn, isMyProfile, getPostByUserId, async function (req, res, next) {
    try {
        const userId = req.params.id;
        
        // 1. Get user info
        const [user] = await db.execute(
            `SELECT * FROM user WHERE user_id = ?`, 
            [userId]
        );
        
        if (!user.length) {
            req.flash('error', 'User not found');
            return res.redirect('/');
        }

        // 2. Get user's posts
        const [posts] = await db.execute(
            `SELECT * FROM posts WHERE fk_userId = ? ORDER BY created_at DESC`,
            [userId]
        );

        // 3. Render profile with data
        res.render('profile', {
            title: 'Profile',
            user: {
                ...user[0],
                user_id: user[0].user_id // Ensure consistent property name
            },
            posts: posts,
            postCount: posts.length
        });
    } catch (err) {
        next(err);
    }
});

// Update your isMyProfile middleware (if you have it) or add this:
router.use('/:id', isLoggedIn, async (req, res, next) => {
    if (parseInt(req.params.id) !== req.session.user.id) {
        req.flash('error', 'You can only view your own profile');
        return res.redirect('/');
    }
    next();
});

module.exports = router;