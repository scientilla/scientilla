// MinMaxYears.js - in api/services
/* global SqlService */

"use strict";

//const _ = require('lodash');

const sqlQueries = {
    'project': 'api/queries/minMaxYearsProjects.sql',
    'accomplishment': 'api/queries/minMaxYearsAccomplishments.sql',
};

module.exports = {
    get
};

async function get(req) {
    const researchEntityId = parseInt(req.params.researchEntityId, 10);
    const type = req.params.type;

    if (type && sqlQueries[type]) {
        const sql = SqlService.readQueryFromFs(sqlQueries[type]);
        return await SqlService.query(sql, [researchEntityId]);
    }

    return {
        type: 'failed'
    };
}