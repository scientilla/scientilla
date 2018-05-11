// GruntTaskRunner.js - in api/services

"use strict";
const exec = require('child_process').exec;

let tasks = [];

module.exports = {
    run
};

async function run(command) {

    return new Promise((resolve, reject) => {

        try {
            const startedAt = new Date();
            const taskObj = exec('grunt ' + command);

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
                const now = new Date();

                sails.log.info('grunt ' + task.command + ' finished in ' + ( (now - task.startedAt) / 1000) + ' seconds with code ' + code);
                tasks = tasks.filter(t => t.taskObj !== taskObj);

                resolve(code);
            });

            sails.log.info('grunt ' + task.command + ' started at ' + task.startedAt.toISOString());
        }
        catch (e) {
            reject();
        }

    });
}