/**
* Collaboration.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

//var months = ["January", "February", "March", "April", "May", "June",
//"July", "August", "September", "October", "November", "December"];
module.exports = {
    attributes: {
        user: {
            model: 'user'
        },
        group: {
            model: 'Group'
        },
        fromMonth: {
          type: 'integer',
          min: 1,
          max: 12
        },
        fromYear: {
          type: 'integer'
        },
        toMonth: {
          type: 'integer',
          min: 1,
          max: 12
        },
        toYear: {
          type: 'integer'
        }
    }
};
