/* global sails,PublicationsConnector,OrcidConnector,ScopusConnector */
"use strict";

const request = require('requestretry');
const _ = require('lodash');
const Promise = require("bluebird");

module.exports = {
    getDocuments,
    getConfig,
    makeRequest
};

async function getDocuments(ResearchEntityModel, researchEntityId, query) {
    const reqConfig = await getConfig(ResearchEntityModel, researchEntityId, query);

    let res = await makeRequest(reqConfig);

    const extracted = reqConfig.fieldExtract(res.body);
    const documents = await Promise.all(_.map(extracted.documents, r => reqConfig.transform(r)));

    res = {
        items: documents,
        count: extracted.count
    };

    return res;
}

async function getConfig(ResearchEntityModel, researchEntityId, query) {
    const connector = query.where.connector;
    if (!connector)
        throw new Error('A Connector parameter is necessary');
    const researchEntity = await ResearchEntityModel.findOneById(researchEntityId);

    switch (connector) {
        case 'Publications':
            return PublicationsConnector.getConfig(researchEntity, query);
        case 'ORCID':
            return OrcidConnector.getConfig(researchEntity, query);
        case 'Scopus':
            return ScopusConnector.getConfig(researchEntity, query);
        default:
            throw 'Connector not found';
    }
}

function makeRequest(reqConfig) {
    return request.get(
        Object.assign({
                maxAttempts: 5,
                retryDelay: 500
            },
            reqConfig.reqParams)
    );
}