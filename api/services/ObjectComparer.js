// ObjectComparer.js - in api/services


var levenshtein = require('fast-levenshtein');
var _ = require('lodash');

module.exports = {
    compareStrings: function(a, b) {
        if (_.isNil(a) || _.isNumber(a))
            a = _.toString(a);
        if (_.isNil(b) || _.isNumber(b))
            b = _.toString(b);
         if (a.length == 0 || b.length == 0)
            return .7;
        if (a.length >=200 || b.length >=200)
            return (a==b) ? 1 : .7;
        const l = Math.max(a.length, b.length);
        return 1-(levenshtein.get(a, b)/l);
    }
};