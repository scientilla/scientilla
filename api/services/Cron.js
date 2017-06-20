// Cron.js - in api/services

"use strict";
const CronJob = require('cron').CronJob;

let cron;
const jobs = [];

module.exports = {
    init: () => {
        addJob(GruntTaskRunner.run, ['external:import:all']);
        addJob(GruntTaskRunner.run, ['documents:synchronize:scopus']);
    },
    start: () => {
        cron = new CronJob(sails.config.scientilla.cron.time, onTick, onStop, false, 'Europe/Rome');
        cron.start();
    },
    stop: () => {
        if (cron)
            cron.stop();
    }
};

async function onTick() {
    for (let job of jobs)
        await job.func(job.params);
}

function addJob(func, params) {
    jobs.push({
        func,
        params
    });
}

function onStop() {

}