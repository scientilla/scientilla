// SqlService.js - in api/services

"use strict";

const _ = require('lodash');
const Promise = require("bluebird");
const GeneratorFn = require('waterline-sql-builder');
const pgp = require('pg-promise')();

const env = sails.config.environment;
const connectionParams = sails.config.connections[env];
const connectionStr = [
    'postgres://', connectionParams.user, ':', connectionParams.password,
    '@', connectionParams.host, ':', connectionParams.port, '/', connectionParams.database
].join('');

var db = pgp(connectionStr);

module.exports = {
    dialect: 'postgresql',
    generateFromJson: query => {
        const dialect = this.dialect;
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
                    else
                        value = parseInt(binding, 10) || "'" + binding + "'";

                    sql = _.replace(sql, regex, '$1' + value + '$2');
                });
                resolve(sql);
            } catch (e) {
                reject(e);
            }
        });

    },
    query: sql => {

        return db
            .query(sql)
            .catch(err => {
                sails.log.debug('The following query generated an error');
                sails.log.debug(sql);
                sails.log.debug(err);
            });
    }
};