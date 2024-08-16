function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'Please log in first to access this page.');
    res.redirect('/');
  }
  
  module.exports = isAuthenticated;
  