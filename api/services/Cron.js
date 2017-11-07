// Cron.js - in api/services

"use strict";
const CronJob = require('cron').CronJob;

let scriptCron, monitorCron;
const DAILY = 'daily', MONITOR = 'monitor';
const jobs = {};

module.exports = {
    init: () => {
        addJob(DAILY, Backup.makeBackup);
        addJob(DAILY, GruntTaskRunner.run, ['import:external:all']);
        addJob(DAILY, GruntTaskRunner.run, ['documents:synchronize:scopus']);
        addJob(DAILY, GruntTaskRunner.run, ['documents:clean:sources']);
        addJob(DAILY, GruntTaskRunner.run, ['documents:clean:institutes']);
        addJob(DAILY, GruntTaskRunner.run, ['documents:clean:copies']);
        addJob(DAILY, GruntTaskRunner.run, ['import:people']);
        addJob(MONITOR, GruntTaskRunner.run, ['monitor']);
    },
    start: () => {
        scriptCron = new CronJob(sails.config.scientilla.cron.daily, generateOnTick(DAILY), onStop, false, 'Europe/Rome');
        scriptCron.start();
        monitorCron = new CronJob(sails.config.scientilla.cron.monitor, generateOnTick(MONITOR), onStop, false, 'Europe/Rome');
        monitorCron.start();
    },
    stop: () => {
        if (scriptCron)
            scriptCron.stop();
        if (monitorCron)
            monitorCron.stop();
    }
};

function generateOnTick(cronName) {
    return async function () {
        for (let job of jobs[cronName])
            await job.func(job.params);
    }
}

function addJob(cronName, func, params) {
    jobs[cronName] = jobs[cronName] || [];
    jobs[cronName].push({
        func,
        params
    });
}

function onStop() {

}