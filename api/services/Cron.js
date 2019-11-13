// Cron.js - in api/services

"use strict";
const CronJob = require('cron').CronJob;
const _ = require('lodash');

const crons = [];

module.exports = {
    start: () => {
        sails.config.scientilla.crons.forEach(cron =>
            crons.push(new CronJob(cron.time, async cron => {
                if (!cron.enabled) {
                    return;
                }

                sails.log.info('Cron ' + cron.name + ' started at ' + new Date().toISOString());

                await GruntTaskRunner.run('Cron:' + cron.name);

                sails.log.info('Cron ' + cron.name + ' finished at ' + new Date().toISOString());
            }, null, false, 'Europe/Rome'))
        );
        crons.forEach(cron => cron.start());
    },
    stop: () => {
        crons.forEach(cron => cron.stop());
    }
};