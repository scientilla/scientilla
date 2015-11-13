/**
* Group.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      name: 'STRING',
      slug: 'STRING',
      memberships: {
          collection: 'membership',
          via: 'group'
      },
      collaborations: {
          collection: 'collaboration',
          via: 'group'
      },
      administrators: {
          collection: 'user',
          via: 'admininstratedGroups'
      }
  }
};

