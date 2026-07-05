module.exports = function(db, bcrypt) {
    const express = require('express');
    const router = express.Router();
    const { check, validationResult } = require('express-validator');

    // Login GET
    router.get('/login', (req, res) => {
        if (req.session.user) {
            return res.redirect('/profile');
        }
        res.render('login', { 
            title: 'Login',
            messages: req.flash()
        });
    });

    // Login POST
    router.post('/login', (req, res) => {
        const { username, password } = req.body;
        
        db.query(
            'SELECT * FROM users WHERE username = ?',
            [username],
            async (err, results) => {
                if (err) {
                    req.flash('error', 'Database error');
                    return res.redirect('/login');
                }
                
                if (results.length === 0) {
                    req.flash('error', 'Invalid username or password');
                    return res.redirect('/login');
                }
                
                const user = results[0];
                const match = await bcrypt.compare(password, user.password);
                
                if (!match) {
                    req.flash('error', 'Invalid username or password');
                    return res.redirect('/login');
                }
                
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email
                };
                
                res.redirect('/profile');
            }
        );
    });

    // Register GET
    router.get('/register', (req, res) => {
        if (req.session.user) {
            return res.redirect('/profile');
        }
        res.render('register', { 
            title: 'Register',
            messages: req.flash()
        });
    });

    // Register POST
    router.post('/register', async (req, res) => {
        const { username, email, password, confirm_password } = req.body;
        
        try {
            // Basic validation
            if (password !== confirm_password) {
                req.flash('error', 'Passwords do not match');
                return res.redirect('/register');
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert user
            db.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            req.flash('error', 'Username or email already exists');
                        } else {
                            req.flash('error', 'Registration failed');
                        }
                        return res.redirect('/register');
                    }
                    
                    req.flash('success', 'Registration successful! Please login');
                    res.redirect('/login');
                }
            );
        } catch (error) {
            req.flash('error', 'Server error during registration');
            res.redirect('/register');
        }
    });

    // Logout
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });

    return router;
};