// Backup.js - in api/services

"use strict";

const _ = require('lodash');
const fs = require('fs');
const exec = require('child_process').exec;
const moment = require('moment');

module.exports = {
    makeBackup,
    makeManualBackup,
    makeTimestampedBackup,
    restoreBackup,
    getDumps
};

async function makeManualBackup(postfix) {
    if (!postfix)
        return Promise.reject('A postfix is needed to name the backup');
    return await makeBackup(postfix);
}

async function makeTimestampedBackup() {
    const postfix = moment().format('hhmmss');
    return await makeBackup(postfix);
}

async function makeBackup(postfix = '') {
    return new Promise(async (resolve, reject) => {
        try {
            const currentDate = moment().format('YYMMDD');
            const binaryBackupFilename = `dump${currentDate}${postfix}.sql`;
            const binaryBackupFilepath = `backups/${binaryBackupFilename}`;
            if (fs.existsSync(binaryBackupFilepath))
                reject(`File ${binaryBackupFilename} already exists`);

            const plainBackupFilename = `dump${currentDate}${postfix}-plain.sql`;
            const plainBackupFilepath = `backups/plain/${plainBackupFilename}`;
            if (fs.existsSync(plainBackupFilepath))
                reject(`File ${plainBackupFilename} already exists`);

            sails.log.info(`Creating backup file ${binaryBackupFilename}`);

            const connectionString = getConnectionString();
            const binaryBackupCmd = `pg_dump -d ${connectionString} -c -C -f "${binaryBackupFilepath}" --inserts -F c`;
            const plainBackupCmd = `pg_dump -d ${connectionString} -c -C -f "${plainBackupFilepath}" --inserts`;
            await runCommand(binaryBackupCmd, 'binary backup creation');
            await runCommand(plainBackupCmd, 'plain backup creation');
            resolve(binaryBackupFilename);
        }
        catch (e) {
            reject(e);
        }
    });
}

async function restoreBackup(filename = null) {
    function getLastAutomaticBackupFilename() {
        const backupFilenames = fs.readdirSync('backups').filter(f => f.startsWith('dump'));
        const automaticBackupFilenames = backupFilenames.filter(f => /dump\d{6}\.sql/.test(f));
        const lastAutomaticBackupFilename = _.last(automaticBackupFilenames.sort());
        return lastAutomaticBackupFilename;
    }

    return new Promise(async (resolve, reject) => {
        try {
            const backupFilename = filename ? filename : getLastAutomaticBackupFilename();
            if (!backupFilename)
                reject('No backup found');
            const backupFilepath = `backups/${backupFilename}`;
            if (!fs.existsSync(backupFilepath))
                reject(`File ${backupFilename} does not exists`);

            sails.log.info(`Restoring backup file ${backupFilename}`);

            const connectionString = getConnectionString();
            const binaryBackupCmd = `pg_restore -d ${connectionString} -n public -c -F c -j 3 ${backupFilepath}`;
            await runCommand(binaryBackupCmd, 'binary backup restore');
            resolve(0);
        }
        catch (e) {
            reject(e);
        }
    })
}

function getDumps() {
    const dumpFilenames = fs.readdirSync('backups').filter(f => f.startsWith('dump'));
    const dumps = dumpFilenames.map(f => ({filename: f}));
    return dumps;
}

async function runCommand(cmd, label) {
    return new Promise((resolve, reject) => {
        const startedAt = new Date();
        const taskObj = exec(cmd);
        sails.log.info(label + ' started at ' + startedAt.toISOString());

        taskObj.stdout.on('data', data => {
            sails.log.info(`${label}: ${data}`);
        });

        taskObj.stderr.on('data', data => {
            sails.log.debug(`${label}: ${data}`);
            reject(data);
        });

        taskObj.on('close', code => {
            const now = new Date();

            sails.log.info(label + ' finished in ' + ( (now - startedAt) / 1000) + ' seconds with code ' + code);

            resolve(code);
        });
    });
}

function getConnectionString() {
    const connectionData = sails.config.connections[sails.config.environment];
    const {user, database, password} = connectionData;
    const connectionString = `postgresql://${user}:${password}@127.0.0.1:5432/${database}`;
    return connectionString;
}
