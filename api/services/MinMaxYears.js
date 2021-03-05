// MinMaxYears.js - in api/services
/* global SqlService */

"use strict";

const sqlQueries = {
    'accomplishment': 'api/queries/minMaxYearsAccomplishments.sql',
    'project': 'api/queries/minMaxYearsProjects.sql',
    'verified_agreements': 'api/queries/minMaxYearsVerifiedAgreements.sql',
    'agreement_drafts': 'api/queries/minMaxYearsAgreementDrafts.sql',
    'patent': 'api/queries/minMaxYearsPatents.sql',
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