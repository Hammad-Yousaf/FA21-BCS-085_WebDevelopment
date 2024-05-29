module.exports = function (req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
      next();
    } else {
      res.flash("danger", "You do not have permission to access this resource");
      res.redirect("/login");
    }
  };