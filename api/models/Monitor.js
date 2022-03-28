/* global SqlService, Monitor */

module.exports = {

    attributes: {
        key: 'STRING',
        value: 'STRING'
    },
    snap: async function () {
        const sqlQueryPath = 'api/queries/monitor.sql';
        const sqlQuery = await SqlService.readQueryFromFs(sqlQueryPath);
        const monitorData = (await SqlService.query(sqlQuery, [])).rows[0];
        for (const key of Object.keys(monitorData))
            await Monitor.create({key: key, value: monitorData[key]})
    }
};

