// GruntTaskRunner.js - in api/services
"use strict";
const path = require('path');
const {spawn} = require('child_process');
const {appendFileSync: appendFile} = require('fs');
const moment = require('moment');
moment.locale('en');

const logFolder = 'logs';
const startLine = '\n┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐\n';
const endLine = '\n└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘\n';
const newLine = '\r\n';

const name = 'tasks';

module.exports = {
    run
};

async function run(command) {
    const startedAt = moment();
    const taskName = command.split(':').slice(0, 2).join(':');

    const setting = await GeneralSettings.findOrCreate(name);
    if (_.has(setting.data, command) && setting.data[command]) {
        return Promise.resolve('Already running!');
    }

    setting.data[command] = true;
    await GeneralSettings.save(name, JSON.stringify(setting.data));

    const startString = 'grunt ' + command + ' started at ' + startedAt.format('DD/MM/YYYY HH:mm:ss');

    sails.log.info(startString);

    await appendToFile(taskName, startedAt, startLine + newLine);
    await appendToFile(taskName, startedAt, startString + newLine);

    return new Promise((resolve, reject) => {
        const gruntTask = spawn('grunt', [command]);

        gruntTask.stdout.on('data', function (data) {
            console.log(data.toString());
            appendToFile(taskName, startedAt, data.toString());
        });

        gruntTask.stderr.on('data', function (data) {
            console.error(data.toString());
            appendToFile(taskName, startedAt, data.toString());
        });

        gruntTask.on('exit', async function (code) {
            const endedAt = moment();
            const duration = moment.duration(endedAt.diff(startedAt)).humanize(true);
            const endString = `grunt ${command} finished with code ${code} at ${endedAt.format('DD/MM/YYYY HH:mm:ss')} ${duration}`;
            if (code !== 0) {
                reject();
            }
            sails.log.info(endString);
            appendToFile(taskName, startedAt, endString + newLine);
            appendToFile(taskName, startedAt, endLine);

            setting.data[command] = false;
            await GeneralSettings.save(name, JSON.stringify(setting.data));

            resolve();
        });
    });
}

function appendToFile(taskName, date, text) {
    const logFile = path.join(logFolder, taskName + '_' + date.format('YYYYMMDD')) + '.log';
    appendFile(logFile, text);
}
