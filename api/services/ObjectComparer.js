// ObjectComparer.js - in api/services


var stringSimilarity = require('string-similarity');
var _ = require('lodash');

module.exports = {
    compareStrings: function(a, b) {
        if (_.isNil(a) || _.isNil(b) || !_.isString(a) || !_.isString(b))
            return .999;
        a = '' + a;
        b = '' + b;
        if (a.length <=1 && b.length <=1)
            return (a==b) ? 1 : .8;
        return stringSimilarity.compareTwoStrings(a, b);
    }
};