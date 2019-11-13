"use strict";

const path = require('path');
const Sails = require('sails');
const _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerTask('cron', async function (...args) {
        const done = this.async();
        Sails.load({ hooks: { grunt: false } }, async () => {
            try {
                const filePath = path.resolve('config', 'scientilla.js');
                const config = require(filePath);
                const crons = config.scientilla.crons.filter(cron => cron.name === args[0]);

                if (crons.length > 0) {
                    for (const cron of crons) {
                        for (const job of cron.jobs) {
                            try {
                                await _.get(global, job.fn)(...job.params);
                            } catch (e) {
                                throw e;
                            }
                        }
                    }
                } else {
                    throw 'Cron not found!';
                }
                done();
            } catch(err) {
                sails.log.debug(err);
                done();
                return 1;
            }
        });
    });
};