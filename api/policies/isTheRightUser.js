'user strict'

module.exports = function(req, res, next) {
    console.log(res.session.user);
  waterlock.validator.validateTokenRequest(req, function(err, user){
    if(err){
      return res.forbidden(err);  
    }
    console.log(user);
    // valid request
    next();
  });
};
