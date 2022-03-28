// SqlService.js - in api/services

"use strict";

const {promisify} = require("util");
const pgp = require('pg-promise')({
    noWarnings: true
});
const readFile = promisify(require('fs').readFile);

const env = sails.config.environment;
const connectionParams = sails.config.connections[env];
const connectionStr = [
    'postgres://',
    encodeURIComponent(connectionParams.user),
    ':',
    encodeURIComponent(connectionParams.password),
    '@',
    connectionParams.host,
    ':',
    connectionParams.port,
    '/',
    connectionParams.database
].join('');

const db = pgp(connectionStr);

module.exports = {
    readQueryFromFs,
    query
};

async function query(sql, params) {
    return db.query(sql, params)
        .catch(err => {
            sails.log.debug('The following query generated an error');
            sails.log.debug(sql);
            sails.log.debug(err);
        });
}

async function readQueryFromFs(filePath) {
    return readFile(filePath, 'utf8');
}
