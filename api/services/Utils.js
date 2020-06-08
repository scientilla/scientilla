// Utils.js - in api/services

"use strict";

const axios = require('axios');
const https = require('https');
const util = require('util');
const fs = require('fs');

module.exports = {
    waitForSuccesfulRequest,
    getActiveDirectoryUsers
};

async function waitForSuccesfulRequest(options) {
    let attempts = 0;
    const maxAttempts = 5;
    const readFile = util.promisify(fs.readFile);

    options.timeout = 100000;

    const httpsOptions = {};

    if (_.has(sails.config.scientilla.userImport, 'cert')) {
        await readFile(sails.config.scientilla.userImport.cert).then(async (file) => {
            httpsOptions.cert = file;
        });
    }

    if (_.has(sails.config.scientilla.userImport, 'key')) {
        await readFile(sails.config.scientilla.userImport.key).then(async (file) => {
            httpsOptions.key = file;
        });
    }

    if (_.has(sails.config.scientilla.userImport, 'logPerson') && _.has(options, 'headers')) {
        options.headers.log_person = sails.config.scientilla.userImport.logPerson
    }

    const httpsAgent = new https.Agent(httpsOptions);
    options.httpsAgent = httpsAgent;

    async function tryRequest(options) {
        attempts++;

        async function retry(options) {
            if (attempts < maxAttempts) {
                return await tryRequest(options);
            } else {
                return new Error('Too much attempts!');
            }
        }

        return await axios(options).catch(async () => {
            return await retry(options);
        });
    }

    let response = await tryRequest(options);

    if (response && _.has(response, 'status') && response.status === 200) {
        if (attempts > 1) {
            sails.log.info('Reached the API after ' + attempts + ' attempt(s)!');
        }

        if (_.has(response, 'data')) {
            return response.data;
        } else {
            return [];
        }
    }

    sails.log.error('Tried ' + attempts + ' time(s), but failed to reach the API!');
    return [];
}

/**
 * This function connects to the Active Directory and returns an array of users.
 **
 * @returns {Object[]}
 */
async function getActiveDirectoryUsers() {
    return await new Promise((resolve, reject) => {
        const ldap = require('ldapjs');
        const client = ldap.createClient({
            url: sails.config.scientilla.ldap.connection.url
        });
        const result = [];

        client.bind(
            sails.config.scientilla.ldap.connection.bindDn,
            sails.config.scientilla.ldap.connection.bindCredentials,
            function(err) {
                if (err) {
                    sails.log.info(err);
                    return;
                }
                const base = sails.config.scientilla.ldap.connection.searchBase;
                const opts = {
                    filter: '(userPrincipalName=*)',
                    scope: 'sub',
                    attributes: ['userPrincipalName']
                };

                client.search(base, opts, function (err, res) {
                    if (err) {
                        reject('Error occurred while LDAP search!');
                    } else {

                        res.on('searchEntry', function (entry) {
                            result.push(entry.object);
                        });
                        res.on('error', function (err) {
                            sails.log.debug(err);
                            resolve([]);
                        });
                        res.on('end', function () {
                            resolve(result);
                        });
                    }
                });
            }
        );
    });
}