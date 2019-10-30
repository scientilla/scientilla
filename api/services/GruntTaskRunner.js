// GruntTaskRunner.js - in api/services
"use strict";

const exec = require('child_process').exec;
const path = require('path');
const logFolder = 'logs';
const fs = require('fs');
const {promisify} = require('util');
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

    const taskObj = exec('grunt ' + command);

    taskObj.stdout.on('data', async data => {
        await writeLine(taskName, startedAt, data);
    });

    taskObj.stderr.on('data', async data => {
        await writeLine(taskName, startedAt, data);
    });

    taskObj.on('close', async code => {
        const endedAt = moment();
        const duration = moment.duration(endedAt.diff(startedAt)).humanize(true);

        let endString = 'grunt ' + command + ' finished at ' + endedAt.format('DD/MM/YYYY HH:mm:ss');
        endString += ' ' + duration + ' with code ' + code;

        sails.log.info(endString);

        await writeLine(taskName, startedAt, endString + '\n');
        await writeLine(taskName, startedAt, endLine);
    });
}

async function writeLine(taskName, date, text) {
    const logFile = path.join(logFolder, taskName + '_' + date.format('YYYYMMDD')) + '.log';
    await appendFile(logFile, text, function (err) {
        if (err) {
            throw err;
        }
    });
}