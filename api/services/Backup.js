// Backup.js - in api/services

"use strict";

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const moment = require('moment');
const util = require('util');

const folder = 'backups';

moment.locale('en');

module.exports = {
    makeBackup,
    makeManualBackup,
    makeTimestampedBackup,
    restoreBackup,
    getDumps,
    isRestoring,
    upload,
    remove,
    download,
    autoDelete
};


const restoreLockFilename = '.restorelock';

async function makeManualBackup(postfix) {
    if (!postfix) {
        return Promise.reject('A postfix is needed to name the backup');
    }

    return await makeBackup(postfix);
}

async function makeTimestampedBackup() {
    const postfix = moment().format('hhmmss');
    return await makeBackup(postfix);
}

async function makeBackup(postfix = '') {
    const currentDate = moment().format('YYMMDD');
    const binaryBackupFilename = `dump${currentDate}${postfix}.sql`;
    const binaryBackupFilepath = folder + `/${binaryBackupFilename}`;
    const stat = util.promisify(fs.stat)
    const unlink = util.promisify(fs.unlink)

    await stat(binaryBackupFilepath).catch(err => {
        return `File ${binaryBackupFilename} already exists`
    })

    sails.log.info(`Creating backup file ${binaryBackupFilename}`);

    const connectionString = getConnectionString();
    const binaryBackupCmd = `pg_dump -d ${connectionString} -c -C -f "${binaryBackupFilepath}" --inserts -F c`;

    try {
        await runCommand(binaryBackupCmd, 'binary backup creation');
    } catch (err) {
        await stat(restoreLockFilename).then(() => {
            unlink(restoreLockFilename)
        })
    }
}

async function restoreBackup(filename = null) {
    async function getLastAutomaticBackupFilename() {
        const readFolder = util.promisify(fs.readdir)
        return await readFolder(folder).then(files => {
            files = files.filter(f => f.startsWith('dump'))
            files = files.filter(f => /dump\d{6}\.sql/.test(f))
            return _.last(files.sort());
        });
    }

    const backupFilename = filename ? filename : await getLastAutomaticBackupFilename();
    const stat = util.promisify(fs.stat)
    const unlink = util.promisify(fs.unlink)

    await stat(restoreLockFilename).catch(err => {
        createFile(restoreLockFilename);
    })

    if (!backupFilename) {
        const message = 'No backup found!'
        sails.debug.log(message)
        return message
    }

    const backupFilepath = folder + `/${backupFilename}`;
    await stat(backupFilepath).catch(err => {
        const message = `File ${backupFilename} does not exists`
        sails.debug.log(message)
        return message
    })

    sails.log.info(`Restoring backup file ${backupFilename}`);

    const connectionString = getConnectionString();
    const binaryBackupCmd = `pg_restore -d ${connectionString} -n public -c -F c -j 3 ${backupFilepath}`;

    try {
        await runCommand(binaryBackupCmd, 'binary backup restore');
    } catch (err) {
        throw err
    }

    await stat(restoreLockFilename).then(async () => {
        return await unlink(restoreLockFilename)
    })
}

async function getDumps() {
    const readdir = util.promisify(fs.readdir)
    const stat = util.promisify(fs.stat)

    return await readdir(folder).then(async(files) => {
        const promises = files.map(async (file) => {
                const extension = path.extname(file);
                const filename = path.basename(file, extension);
                const stats = await stat(path.join(folder, file)).then(stats => {
                    return stats
                });
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

        return await Promise.all(promises).then(files => {
            return files
        })
    })
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

async function createFile(filepath) {
    const open = util.promisify(fs.open)
    const close = util.promisify(fs.close)
    await open(filepath, 'a').then(async file => {
        await close(file)
    })
}

async function isRestoring() {
    const stat = util.promisify(fs.stat)
    return await stat(restoreLockFilename)
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
            dirname: path.resolve(sails.config.appPath, folder)
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
        fs.unlink(path.join(sails.config.appPath, folder, filename), function(err) {
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

async function download(filename) {
    const filePath = path.resolve(sails.config.appPath, folder, filename);
    const stat = util.promisify(fs.stat)

    return stat(filePath).then(() => {
        return fs.createReadStream(filePath)
    }).catch(err => {
        throw {
            success: false,
            message: 'Backup not found!'
        };
    })
}

/*
 * Get the dates of the backups that should be kept
 */
function getBackupDates(startDate = false) {

    sails.log.debug('-----------------')
    sails.log.debug('Calculating dates')

    if (!startDate) {
        startDate = moment()
    }

    let tmpStartDate = startDate.clone()

    // Get the last seven days
    const lastSevenDays = [tmpStartDate.format('YYYY-MM-DD')]

    for (let i = 0; i < 7; i++) {
        lastSevenDays.push(tmpStartDate.subtract(1, 'd').format('YYYY-MM-DD'))
    }

    // Get the last four mondays before the last seven days
    let fourMondaysBeforeLastSevenDays = []
    if (tmpStartDate.weekday() === 1) {
        fourMondaysBeforeLastSevenDays.push(tmpStartDate.subtract(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD'))
    } else {
        fourMondaysBeforeLastSevenDays.push(tmpStartDate.startOf('isoWeek').format('YYYY-MM-DD'))
    }
    for (let i = 0; i < 3; i++) {
        fourMondaysBeforeLastSevenDays.push(tmpStartDate.subtract(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD'))
    }

    // Get the first day of the last six months
    const firstDayOfLastSixMonths = []
    tmpStartDate = startDate.clone()
    firstDayOfLastSixMonths.push(tmpStartDate.date(1).format('YYYY-MM-DD'))
    for (let i = 0; i < 5; i++) {
        firstDayOfLastSixMonths.push(tmpStartDate.subtract(1,'months').date(1).format('YYYY-MM-DD'))
    }

    const dates = lastSevenDays.concat(fourMondaysBeforeLastSevenDays, firstDayOfLastSixMonths)

    sails.log.debug(dates.length + ' file(s) will be kept!')

    return dates
}

/*
 * Remove all backups that should be deleted
 */
async function removeSelectedBackups(dates) {
    let deletedFiles = 0

    sails.log.debug('-----------------')
    sails.log.debug('Deleting files...')

    const readFolder = util.promisify(fs.readdir)
    await readFolder(folder).then(async (files) => {
        const promises = files.map(async (file) => {
            const extension = path.extname(file)
            const filename = path.basename(file, extension).replace('dump', '')
            const date = moment(filename, 'YYMMDDHHmmss')

            const filteredDates = dates.filter(d => {
                return d === date.format('YYYY-MM-DD')
            })

            if (filteredDates.length === 0) {
                const deleteFile = util.promisify(fs.unlink)
                return await deleteFile(path.join(folder, file)).then(() => {
                    sails.log.debug('Deleting ' + file + ' for date ' + dates[0])
                    deletedFiles++
                })
            }
        })

        await Promise.all(promises).then(() => {
            sails.log.debug(deletedFiles + ' file(s) deleted!')
        })
    }).catch(err => {
        throw err
    })
}

async function autoDelete() {
    const startDate = moment()
    const dates = getBackupDates(startDate)
    await removeSelectedBackups(dates)
}