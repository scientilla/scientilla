/* global sails,PublicationsConnector,OrcidConnector,ScopusConnector */
"use strict";

const request = require('requestretry');
const _ = require('lodash');
const Promise = require("bluebird");

module.exports = {
    getDocuments: async function (ResearchEntityModel, researchEntityId, query, skipCopiedCheck) {
        const connector = query.where.connector;
        if (!connector)
            throw new Error('A Connector parameter is necessary');
        const researchEntity = await ResearchEntityModel.findOneById(researchEntityId);

        let reqConfig;
        switch (connector) {
            case 'Publications':
                reqConfig = PublicationsConnector.getConfig(researchEntity, query);
                break;
            case 'ORCID':
                reqConfig = OrcidConnector.getConfig(researchEntity, query);
                break;
            case 'Scopus':
                reqConfig = ScopusConnector.getConfig(researchEntity, query);
                break;
            default:
                throw 'Connector not found';
        }

        let res = await makeRequest(reqConfig);

        if (!skipCopiedCheck) {
            return {
                items: await ResearchEntityModel.checkCopiedDocuments(ResearchEntityModel, researchEntityId, res.items, true),
                count: res.count
            };
        }

        return res;
    }
};

async function makeRequest(reqConfig) {
    const res = await request.get(
        Object.assign({
                maxAttempts: 5,
                retryDelay: 500
            },
            reqConfig.reqParams)
    );
    const extracted = reqConfig.fieldExtract(res.body);
    const documents = await Promise.all(_.map(extracted.documents, r => reqConfig.transform(r)));

    return {
        items: documents,
        count: extracted.count
    };
}