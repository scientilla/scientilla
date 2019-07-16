// Backup.js - in api/services

"use strict";

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const moment = require('moment');

module.exports = {
    makeBackup,
    makeManualBackup,
    makeTimestampedBackup,
    restoreBackup,
    getDumps,
    isRestoring,
    upload,
    remove,
    download
};


const restoreLockFilename = '.restorelock';

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

            sails.log.info(`Creating backup file ${binaryBackupFilename}`);

            const connectionString = getConnectionString();
            const binaryBackupCmd = `pg_dump -d ${connectionString} -c -C -f "${binaryBackupFilepath}" --inserts -F c`;
            await runCommand(binaryBackupCmd, 'binary backup creation');
            resolve(binaryBackupFilename);
        } catch (e) {
            reject(e);
            if (fs.existsSync(restoreLockFilename))
                fs.unlinkSync(restoreLockFilename);
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
            if (!fs.existsSync(restoreLockFilename))
                createFile(restoreLockFilename);
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
            if (fs.existsSync(restoreLockFilename))
                fs.unlinkSync(restoreLockFilename);
            resolve(0);
        } catch (e) {
            if (fs.existsSync(restoreLockFilename))
                fs.unlinkSync(restoreLockFilename);
            reject(e);
        }
    })
}

function getDumps() {
    const folder = 'backups';
    return fs.readdirSync(folder)
        .map(file => {
            const extension = path.extname(file);
            const filename = path.basename(file, extension);
            const stats = fs.statSync(path.join(folder, file));
            const date = new Date(stats.birthtime);
            moment.tz.setDefault('Europe/Rome');

            return {
                filename: filename,
                uploaded: !filename.startsWith('dump'),
                extension: extension,
                size: formatBytes(stats.size),
                created: moment(date, 'YYYY-MM-DDTHH:mm:ss.sssZ').format('DD/MM/YYYY HH:mm:ss')
            };
        })
        .filter(file => file.filename !== '.gitkeep')
        .sort((a, b) => {
            return moment(b.created, 'DD/MM/YYYY HH:mm:ss').format('DDMMYYYYHHmmss') - moment(a.created, 'DD/MM/YYYY HH:mm:ss').format('DDMMYYYYHHmmss');
        });
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
            throw data;
        });

        taskObj.on('close', code => {
            const now = new Date();

            sails.log.info(label + ' finished in ' + ((now - startedAt) / 1000) + ' seconds with code ' + code);

            resolve(code);
        });
    });
}

function getConnectionString() {
    const connectionData = sails.config.connections[sails.config.environment];
    const {user, database, password, host} = connectionData;
    return `postgresql://${user}:${password}@${host}:5432/${database}`;
}

function createFile(filepath) {
    fs.closeSync(fs.openSync(filepath, 'a'));
}

function isRestoring() {
    return fs.existsSync(restoreLockFilename);
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function upload(req) {
    return new Promise(function (resolve, reject) {
        req.file('file').upload({
            maxBytes:10000000000000,
            saveAs: req.file('file')._files[0].stream.filename,
            dirname: path.resolve(sails.config.appPath, 'backups')
        }, function (err, file) {
            if (err) {
                reject(err);
            }

            resolve(file);
        });
    }).then(file => {
        return {
            type: 'success',
            message: 'Backup successfully uploaded!',
            file: file
        };
    }).catch(() => {
        return {
            type: 'failed',
            message: 'Failed to upload the backup!'
        };
    });
}

async function remove(filename) {
    return new Promise(function (resolve, reject) {
        fs.unlink(path.join(sails.config.appPath, 'backups', filename), function(err) {
            if (err) {
                reject(err);
            }

            resolve();
        });
    }).then(() => {
        return {
            type: 'success',
            message: 'Backup successfully removed!'
        };
    }).catch(() => {
        return {
            type: 'failed',
            message: 'Failed to remove the backup!'
        };
    });
}

function download(filename) {
    return new Promise(async function (resolve, reject) {
        const filePath = path.resolve(sails.config.appPath, 'backups', filename);

        if (fs.existsSync(filePath)) {
            const readStream = fs.createReadStream(filePath)
            resolve(readStream)
        } else {
            reject();
        }
    }).then(response => {
        return {
            type: 'success',
            response: response
        };
    }).catch(() => {
        return {
            type: 'failed'
        };
    });
}