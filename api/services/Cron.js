// Cron.js - in api/services

"use strict";
const CronJob = require('cron').CronJob;
const _ = require('lodash');

const crons = [];

module.exports = {
    start: () => {
        sails.config.scientilla.crons.forEach(cron => {
            crons.push(new CronJob(cron.time, generateOnTick(cron), null, false, 'Europe/Rome'))
        });
        crons.forEach(cron => cron.start());
    },
    stop: () => {
        crons.forEach(cron => cron.stop());
    }
};

function generateOnTick(cron) {
    return async function () {
        if (!cron.enabled) {
            return;
        }

        sails.log.info('Cron ' + cron.name + ' started at ' + new Date().toISOString());
        try{
            await GruntTaskRunner.run('cron:' + cron.name);
        } catch(e) {
            sails.log.debug(e);
        }

        sails.log.info('Cron ' + cron.name + ' finished at ' + new Date().toISOString());
    }
}