module.exports = async function(req,res,next){
    console.log("Session User in Auth Middleware:", req.session.user);
    if(!req.session.user){
        res.flash("danger", "Only logged in users are allowed to access!");
        return res.redirect("/login");
    }
    return next();
}