'use strict';
/* jshint unused:false */

/**
 * hasJsonWebToken
 *
 * @module      :: Policy
 * @description :: Assumes that your request has an jwt;
 *
 * @docs        :: http://waterlock.ninja/documentation
 */
module.exports = function(req, res, next) {
//  console.log(res.session);
  waterlock.validator.validateTokenRequest(req, function(err, user){
    if(err){
      return res.forbidden(err);  
    }
//    console.log(user);

    // valid request
    next();
  });
};
