// ObjectComparer.js - in api/services


var levenshtein = require('fast-levenshtein');
var _ = require('lodash');

module.exports = {
    compareStrings: function(a, b) {
        if (_.isNil(a) || _.isNil(b) || !_.isString(a) || !_.isString(b))
            return .6;
        if (a.length >=200 || b.length >=200 || a.length == 0 || b.length == 0)
            return (a==b) ? 1 : .6;
        const l = Math.max(a.length, b.length);
        return 1-(levenshtein.get(a, b)/l);
    }
};