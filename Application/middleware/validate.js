const db = require('../conf/database');
const bcrypt = require('bcrypt');

module.exports = {
    doesUsernameExist: async function (req, res, next) {
        console.log("Checking if username exists...", req.body.username);

        var {username} = req.body;
        var [rows,_] = await db.query(
            'select user_id from user where username=?;',
            [username]);
        if (rows && rows.length == 1){
            req.flash('error', `The username, ${username} already exists!`);
            return req.session.save((err) => {
                console.log("redirecting to registration due to existing username");
                return res.redirect('/registration');
            });
        }else{
            next();
        }    
    },
    doesEmailExist: async function (req, res, next) {
        var {email} = req.body;
        var [rows,_] = await db.query(
            'select user_id from user where email=?;',
            [email]);
        if (rows && rows.length){
            req.flash('error', `The email, ${email} already exists!`);
            return req.session.save((err) => {
                console.log("redirecting to registration due to existing email");
                return res.redirect('/registration');
            });
        }else{
            next();
        }    
    },
    validateUsername: async function (req, res, next) {
        const {username} = req.body;
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            req.flash('error', 'Username must be 3-20 characters long!!');
            return req.session.save((err) => {
                console.log("redirecting to registration due to invalid username");
                return res.redirect('/registration');
            });
        }else{
            next();
        }
    },
    validatePassword: async function (req, res, next) {
        const {password} = req.body;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;        
        if (!passwordRegex.test(password)) {
            req.flash('error', 'Password must be at least 8 characters long, contain a lowercase letter, an uppercase letter, a number, and a special character (!@#$%^&*).');
            return req.session.save((err) => {
                console.log("Redirecting to registration due to invalid password");
                return res.redirect('/registration');
            });
        }
        next();
    },
    validateEmail: async function (req, res, next) {
        const {email} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.flash('error', 'Invalid email format.');
            return req.session.save((err) => {
                console.log("redirecting to registration due to invalid email");
                return res.redirect('/registration');
            });
        }
        next();
    },
    checkLogin: async function(req, res, next) {
        console.log("check Login");
        const { username, password } = req.body;
        // Input validation
        if (!username || !password) {
            req.flash('error', 'Username and password are required.');
            console.log("Username pass wrong");
            return res.redirect('/login');
        }
        try {
            // 1. Check if user exists
            const [rows] = await db.query('SELECT * FROM user WHERE username=?;', [username]);
            const user = rows?.[0];
            // 2. Validate password (with error handling)
            const isMatch = user?.password 
            ? await bcrypt.compare(password, user.password).catch(() => false)
            : false;
            console.log("pass match: ", isMatch);
            if (!user || !isMatch) {
            req.flash('error', 'Invalid username or password.');
            return req.session.save((err) => err ? next(err) : res.redirect('/login'));
            }
            // 3. Attach user to request
            req.user = user;
            next();
        } catch (err) {
            next(err); // Pass DB/bcrypt errors to the error handler
        }
    },
   isLoggedIn: function(req, res, next) {
        console.log("isLoggedIn")
        if(req.session.user) {
            console.log("Yes user is not logged in")
            next(); // User is logged in, proceed to the next middleware
        }else{
            console.log("No user is not logged in")
            req.flash('error', 'You must be logged in to access this page.');
            return req.session.save((err) => {
                if (err) next(err);
                return res.redirect('/'); // Redirect to login page
            })
        }
    },
    isNotLoggedIn: function (req, res, next) {
        console.log("isNotLoggedIn");
        if (!req.session.user) {
            return next();
        }

        console.log("User already logged in, redirecting to home page");
        return res.redirect('/'); // Redirect to home if already logged in
    },
    isMyProfile: function(req, res, next) {
    const profileId = parseInt(req.params.id); // URL parameter
    const loggedInUserId = parseInt(req.session.user.id); // Session ID
    
    if (loggedInUserId === profileId) {
        next(); // Allow access
    } else {
        req.flash('error', 'You can only view your own profile');
        return req.session.save((err) => {
            if (err) return next(err);
            return res.redirect('/');
        });
    }
}
};