// MinMaxYears.js - in api/services
/* global SqlService */

"use strict";

const sqlQueries = [{
    type: 'accomplishment',
    section: 'verified',
    file: 'api/queries/minMaxYearsAccomplishments.sql'
}, {
    type: 'project',
    section: 'suggested',
    file: 'api/queries/minMaxYearsSuggestedProjects.sql'
}, {
    type: 'project',
    section: 'verified',
    file: 'api/queries/minMaxYearsVerifiedProjects.sql'
}, {
    type: 'agreement',
    section: 'verified',
    file: 'api/queries/minMaxYearsAgreements.sql'
}, {
    type: 'patent',
    section: 'suggested',
    file: 'api/queries/minMaxYearsSuggestedPatents.sql'
}, {
    type: 'patent',
    section: 'discarded',
    file: 'api/queries/minMaxYearsDiscardedPatents.sql'
}, {
    type: 'patent',
    section: 'verified',
    file: 'api/queries/minMaxYearsVerifiedPatents.sql'
}];

module.exports = {
    get
};

async function get(req) {
    const researchEntityId = parseInt(req.params.researchEntityId, 10);
    const type = req.params.type;
    const section = req.params.section || 'verified';
    const query = sqlQueries.find(query => query.type === type && query.section === section);

    if (query) {
        const sql = await SqlService.readQueryFromFs(query.file);
        return await SqlService.query(sql, [researchEntityId]);
    }

    return {
        type: 'failed'
    };
}
