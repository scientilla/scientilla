/**
 * Affiliation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        authorship: {
            model: 'authorship'
        },
        document: {
            model: 'document'
        },
        institute: {
            model: 'institute'
        }
    },
    beforeCreate: function (values, cb) {
        Authorship
            .findOneById(values.authorship)
            .then(authorship => {
                values.document = authorship.document;
                cb()
            })
    }
};

