/**
 * Institute.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        name: 'STRING',
        country: 'STRING',
        city: 'STRING',
        shortname: 'STRING',
        scopusId: 'STRING',
        group: {
            model: 'group'
        },
        authorships: {
            collection: 'authorship',
            via: 'affiliations',
            through: 'affiliation'
        },
        aliasOf: {
            model: 'institute'
        },
        documents: {
            collection: 'document',
            via: 'institutes',
            through: 'affiliation'
        },
    },
    findOrCreateRealInstitute: function(i) {
        return Institute.findOrCreate({scopusId: i.scopusId}, i)
            .then(i => {
                if (!i.aliasOf)
                    return i;
                return findOneById(i.aliasOf);
            });
    }
};

