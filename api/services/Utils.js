// Utils.js - in api/services

"use strict";

const axios = require('axios');
const https = require('https');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);

module.exports = {
    waitForSuccesfulRequest,
    getActiveDirectoryUsers
};


async function waitForSuccesfulRequest(options) {
    const maxAttempts = 5;

    options.timeout = options.timeout || 100000;

    if (options.httpsAgent) {
        options.httpsAgent = new https.Agent(Object.assign({},
            options.httpsAgent,
            {
                cert: await readFile(options.httpsAgent.cert),
                key: await readFile(options.httpsAgent.key)
            }));
    }

    let response = await tryRequest(options, maxAttempts);

    if (response && _.has(response, 'status') && response.status === 200) {
        return response.data;
    }

    throw response;
}

async function tryRequest(options, maxAttempts, attempts = 0) {
    try {
        return await axios(options);
    } catch (e) {
        if (attempts < maxAttempts) {
            return await tryRequest(options, maxAttempts, attempts + 1);
        }

        throw `Tried ${attempts} time(s), but failed to reach the API!`;
    }
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
            url: sails.config.scientilla.ldap.connection.url,
            tlsOptions: sails.config.scientilla.ldap.connection.tlsOptions
        });
        const result = [];

        client.bind(
            sails.config.scientilla.ldap.connection.bindDn,
            sails.config.scientilla.ldap.connection.bindCredentials,
            function (err) {
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