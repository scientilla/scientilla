/* global User */

// SqlService.js - in api/services


var _ = require('lodash');
var Promise = require("bluebird");
var Pack = require('machinepack-sql-builder');

module.exports = {
    dialect: 'postgresql',
    generateFromJson: function (query) {

        var dialect = this.dialect;

        var generateSql = function (q) {
            return new Promise(function (resolve, reject) {

                Pack.generateSql({
                    dialect: dialect,
                    query: q
                }).exec({
                    success: resolve,
                    error: reject
                });
            });
        };


        return generateSql(query)
                .then(function (result) {
                    var sql = result.sql;

                    _.forEach(result.bindings, function (binding, i) {
                        var key = '\\$' + (i + 1);
                        var regex = new RegExp('([\\s(]){1}' + key + '([\\s,)]|$){1}');

                        // TODO escape binding
                        var value;
                        var uppercaseBinding = _.upperCase(binding);
                        if (_.includes(['FALSE', 'TRUE'], uppercaseBinding))
                            value = uppercaseBinding === "TRUE";
                        else
                            value = parseInt(binding, 10) || "'" + binding + "'";

                        sql = _.replace(sql, regex, '$1' + value + '$2');
                    });

                    return sql;
                });
    },
    query: function (sql) {
        return Promise
                .promisify(User.query)(sql)
                .then(function (result) {
                    return result.rows;
                })
                .catch(function (err) {
                    console.log(sql);
                    console.log(err);
                });
    }
};