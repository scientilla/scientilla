// GruntTaskRunner.js - in api/services
"use strict";
const _ = require('lodash');
const path = require('path');
const logFolder = 'logs';
const fs = require('fs');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const appendFile = promisify(fs.appendFile);
const moment = require('moment');
moment.locale('en');

const startLine = '\n┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐\n';
const endLine   = '\n└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘\n';

module.exports = {
    run
};

async function run(command) {
    const startedAt = moment();
    const taskName = command.split(':').slice(0, 2).join(':');

    const startString = 'grunt ' + command + ' started at ' + startedAt.format('DD/MM/YYYY HH:mm:ss');

    sails.log.info(startString);

    await writeLine(taskName, startedAt, startLine + '\n');
    await writeLine(taskName, startedAt, startString + '\n');

    const { stdout, stderr } = await exec('grunt ' + command);

    const output = stdout.split('\n');
    for (let i = 0; i < output.length; i++) {
        await writeLine(taskName, startedAt, output[i]);
    }

    const errors = stderr.split('\n');
    for (let i = 0; i < errors.length; i++) {
        await writeLine(taskName, startedAt, errors[i]);
    }

    const endedAt = moment();
    const duration = moment.duration(endedAt.diff(startedAt)).humanize(true);

    const endString = 'grunt ' + command + ' finished at ' + endedAt.format('DD/MM/YYYY HH:mm:ss') + ' ' + duration;

    sails.log.info(endString);

    await writeLine(taskName, startedAt, endString + '\n');
    await writeLine(taskName, startedAt, endLine);

    if (!_.isEmpty(stderr)) {
        return {
            type: 'error',
            message: stderr
        }
    } else {
        return {
            type: 'success',
            message: stdout
        }
    }
}

async function writeLine(taskName, date, text) {
    const logFile = path.join(logFolder, taskName + '_' + date.format('YYYYMMDD')) + '.log';
    await appendFile(logFile, text + '\r\n', function (err) {
        if (err) {
            throw err;
        }
    });
}