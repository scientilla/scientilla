// Cleaner.js - in api/services

"use strict";

const _ = require('lodash');
const exec = require('child_process').exec;

module.exports = {
    makeBackup
};

async function makeBackup() {
    return new Promise((resolve, reject) => {

        try {
            const startedAt = new Date();
            const connectionData = sails.config.connections[sails.config.environment];
            const user = connectionData.user;
            const database = connectionData.database;
            const password = connectionData.password;
            const cmd = `pg_dump --dbname=postgresql://${user}:${password}@127.0.0.1:5432/${database} --create --clean --file="backups/dump$(date +'%y%m%d').sql" --inserts`
            const taskObj = exec(cmd);

            taskObj.stdout.on('data', data => {
                sails.log.info('backup: ' + data);
            });

            taskObj.stderr.on('data', data => {
                sails.log.debug('backup: ' + data);
            });

            taskObj.on('close', code => {
                const now = new Date();

                sails.log.info('backup finished in ' + ( (now - startedAt) / 1000) + ' seconds with code ' + code);

                resolve(code);
            });

            sails.log.info('backup started at ' + startedAt.toISOString());
        }
        catch (e) {
            reject(e);
        }
    })
}