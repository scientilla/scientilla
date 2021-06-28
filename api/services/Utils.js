// Utils.js - in api/services

"use strict";

const moment = require('moment');
const axios = require('axios');
const https = require('https');
const util = require('util');
const fs = require('fs');
const path = require('path');
const appendFile = util.promisify(fs.appendFile);
const exists = util.promisify(fs.exists);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = {
    stringToSlug,
    waitForSuccessfulRequest,
    getActiveDirectoryUsers,
    log
};

function stringToSlug (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    const to   = "aaaaeeeeiiiioooouuuunc------";
    for (let i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

async function waitForSuccessfulRequest(options, logMethod = false, print = true) {
    const maxAttempts = 10;

    options.timeout = options.timeout || 600000;

    if (options.httpsAgent) {
        options.httpsAgent = new https.Agent(Object.assign({},
            options.httpsAgent,
            {
                cert: await readFile(options.httpsAgent.cert),
                key: await readFile(options.httpsAgent.key)
            }));
    }

    let response = await tryRequest(options, maxAttempts, logMethod, print);

    if (response && _.has(response, 'status') && response.status === 200) {
        return response.data;
    }

    throw response;
}

async function tryRequest(options, maxAttempts, logMethod = false, print = true, attempts = 0) {
    const waitFor = 60000; // 60000 ms = 1 minute

    try {
        if (attempts != 0) {
            await new Promise(resolve => setTimeout(resolve, waitFor));
        }

        await log(`${moment()} Try to reach ${axios.getUri(options)} for the ${attempts + 1}th time ...`, logMethod, print);

        return await axios(options);
    } catch (e) {
        await log(`${moment()} Failed to reach ${axios.getUri(options)} for the ${attempts + 1}th time ...`, logMethod, print);

        if (attempts < maxAttempts) {
            return await tryRequest(options, maxAttempts, logMethod, print, attempts + 1);
        }

        if (e && e.response && e.response.status && e.response.statusText) {
            await log(`${e.response.status}: ${e.response.statusText}`, logMethod, print);
        } else {
            await log(e);
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

async function log(text = '', logMethod = false, print = true) {
    if (print) {
        sails.log.info(text);
    }

    if (logMethod !== false) {
        const logFile = path.join('logs', logMethod, moment().format('YYYYMMDD') + '.log');

        if (!await exists(path.join('logs', logMethod))) {
            await mkdir(path.join('logs', logMethod));
        }

        if (await exists(logFile)) {
            await appendFile(logFile, '\n' + text);
        } else {
            await writeFile(logFile, text);
        }
    }
}