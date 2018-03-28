// Cron.js - in api/services

"use strict";
const CronJob = require('cron').CronJob;

const crons = [];

module.exports = {
    start: () => {
        sails.config.scientilla.crons.forEach(cron =>
            crons.push(new CronJob(cron.time, generateOnTick(cron), onStop, false, 'Europe/Rome'))
        );
        crons.forEach(cron => cron.start());
    },
    stop: () => {
        crons.forEach(cron => cron.stop());
    }
};

function generateOnTick(cron) {
    return async function () {
        if (!cron.enabled)
            return;

        sails.log.info('Cron ' + cron.name + ' started at ' + new Date().toISOString());

        for (const job of cron.jobs) {
            try {
                await _.get(global, job.fn)(...job.params);
            } catch (e) {
                sails.log.error(e);
            }
        }

        sails.log.info('Cron ' + cron.name + ' finished at ' + new Date().toISOString());
    }
}

function onStop() {

}