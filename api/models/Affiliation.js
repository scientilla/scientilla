/* global Authorship, Affiliation*/
"use strict";

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

