/**
 * ResetToken
 *
 * @module      :: Model
 * @description :: Describes a users reset token
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.resetToken.attributes({
    
    /* e.g.
    nickname: 'string'
    */
    
  }),

  beforeCreate: require('waterlock').models.resetToken.beforeCreate,
  afterCreate: require('waterlock').models.resetToken.afterCreate
};
