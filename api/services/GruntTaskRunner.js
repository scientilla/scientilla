// GruntTaskRunner.js - in api/services

"use strict";
const exec = require('child_process').exec;
const path = require('path');
const logFolder = 'logs';

const moment = require('moment');
moment.locale('en');

let tasks = [];

module.exports = {
    run
};

async function run(command) {

    return new Promise(async (resolve, reject) => {
        try {
            const startedAt = moment();
            const taskName = command.split(':').slice(0, 2).join(':');
            const file = path.join(logFolder, taskName + '_' + startedAt.format('YYYYMMDD')) + '.log';
            const taskObj = exec('grunt ' + command + ' >> ' + file);
            const task = {
                command,
                taskObj,
                startedAt
            };
            tasks.push(task);

            taskObj.stdout.on('data', data => {
                sails.log.info('grunt ' + task.command + ': ' + data);
            });

            taskObj.stderr.on('data', data => {
                sails.log.debug('grunt ' + task.command + ': ' + data);
            });

            taskObj.on('close', code => {
                const endedAt = moment();

                sails.log.info('grunt ' + task.command + ' finished in ' + endedAt.diff(startedAt, 'seconds') + ' seconds with code ' + code);
                tasks = tasks.filter(t => t.taskObj !== taskObj);

                resolve(code);
            });

            sails.log.info('grunt ' + task.command + ' started at ' + task.startedAt.format('DD/MM/YYYY HH:mm:ss'));
        } catch (e) {
            reject(e);
        }
    });
}