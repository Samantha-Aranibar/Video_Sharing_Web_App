//Have it in validation -> isLoggedIn andd isMyProfile

module.exports ={
    isLoggedIn: function(req, res, next) {
        if(req.session.user) {
            next(); // User is logged in, proceed to the next middleware
        }else{
            req.flash('error', 'You must be logged in to access this page.');
            return req.session.save((err) => {
                if (err) next(err);
                return res.redirect('/'); // Redirect to login page
            })
        }
    },

    isMyProfile: function(req,res,next){
        const userId = req.params.id; // Get the user ID from the URL parameter
        if(req.session.user.userId == userId) {
            next(); // User is accessing their own profile, proceed
        }else{
            req.flash('error', 'This is not the profil you are looking for.');
            return req.session.save((err) => {
                if (err) next(err);
                return res.redirect('/'); // Redirect to login page
            })
        }
    }
}