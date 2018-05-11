/**
 * Monitor.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Promise = require("bluebird");

module.exports = {

    attributes: {
        key: 'STRING',
        value: 'STRING'
    },
    snap: async function () {
        const query = Promise.promisify(Monitor.query);
        const sqlQueryPath = 'api/queries/monitor.sql';
        const sqlQuery = SqlService.readQueryFromFs(sqlQueryPath);
        const monitorData = (await query(sqlQuery, [])).rows[0];
        for (const key of Object.keys(monitorData))
            await Monitor.create({key: key, value: monitorData[key]})
    }
};

