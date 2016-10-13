/* global User */

// SqlService.js - in api/services


var _ = require('lodash');
var Promise = require("bluebird");
var GeneratorFn = require('waterline-sql-builder');

module.exports = {
    dialect: 'postgresql',
    generateFromJson: function (query) {
        var dialect = this.dialect;
        var generator = GeneratorFn({ dialect: dialect });

        return new Promise(function (resolve, reject) {
            try {
                var result = generator.generate(query);
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
                resolve(sql);
            } catch(e) {
                reject(e);
            }
        });


        return generateSql(query)
                .then(function (result) {
                });
    },
    query: function (sql) {
        return Promise
                .promisify(User.query)(sql)
                .then(function (result) {
                    return result.rows;
                })
                .catch(function (err) {
                    sails.log.debug('The following query generated an error');
                    sails.log.debug(sql);
                    sails.log.debug(err);
                });
    }
};