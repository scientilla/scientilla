// SqlService.js - in api/services

"use strict";

const _ = require('lodash');
const Promise = require("bluebird");
const GeneratorFn = require('waterline-sql-builder');
const pgp = require('pg-promise')({
    noWarnings: true
});
const fs = require('fs');

const env = sails.config.environment;
const connectionParams = sails.config.connections[env];
const connectionStr = [
    'postgres://', connectionParams.user, ':', connectionParams.password,
    '@', connectionParams.host, ':', connectionParams.port, '/', connectionParams.database
].join('');

var db = pgp(connectionStr);

module.exports = {
    generateFromJson: query => {
        const dialect = 'postgresql';
        const generator = GeneratorFn({dialect: dialect});

        return new Promise((resolve, reject) => {
            try {
                const result = generator.generate(query);
                let sql = result.sql;

                _.forEach(result.bindings, (binding, i) => {
                    const key = '\\$' + (i + 1);
                    const regex = new RegExp('([\\s(]){1}' + key + '([\\s,)]|$){1}');

                    // TODO escape binding
                    let value;
                    const uppercaseBinding = _.upperCase(binding);
                    if (_.includes(['FALSE', 'TRUE'], uppercaseBinding))
                        value = uppercaseBinding === "TRUE";
                    else if (/^\w+\.?\w*$/.test(binding))
                        value = parseInt(binding, 10)
                    else
                        value = "'" + binding + "'";

                    sql = _.replace(sql, regex, '$1' + value + '$2');
                });
                resolve(sql);
            } catch (e) {
                reject(e);
            }
        });
    },
    readQueryFromFs: (filePath) => {
        return fs.readFileSync(filePath, 'utf-8');
    },
    query: (sql, params) => db.query(sql, params)
        .catch(err => {
            sails.log.debug('The following query generated an error');
            sails.log.debug(sql);
            sails.log.debug(err);
        })
};