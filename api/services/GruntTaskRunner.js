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

            taskObj.stdout.on('data', data => {
                sails.log.debug(data);
            });

            taskObj.stderr.on('data', data => {
                sails.log.error(data);
            });

            taskObj.on('close', code => {
                const task = tasks.find(t => t.taskObj === taskObj);
                const now = new Date();

                sails.log.info('grunt ' + task.command + ' finished in ' + ( (now - task.startedAt) / 1000) + ' seconds with code ' + code);
                tasks = tasks.filter(t => t.taskObj !== taskObj);

                resolve(code);
            });

            const task = {
                command,
                taskObj,
                startedAt
            };

            tasks.push(task);

            sails.log.info('grunt ' + task.command + ' started at ' + task.startedAt.toISOString());
        }
        catch (e) {
            reject();
        }

    });
}