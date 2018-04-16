/* global sails, PublicationsConnector, OrcidConnector, ScopusConnector, DocumentOrigins */
"use strict";

const request = require('requestretry');
const _ = require('lodash');
const Promise = require("bluebird");

module.exports = {
    getDocuments,
    getConfig,
    makeRequest,
    getDocument,
    getDocumentByDoi
};

async function getDocuments(origin, originId, params) {
    const reqConfig = await getConfig(origin, originId, params);
    return await getExtractTransformDocuments(reqConfig);
}

function getConfig(origin, searchKey, params = {}) {
    const p = _.defaults({}, params, {
        skip: 0,
        limit: 10,
        type: 'author'
    });
    const originConnector = getConnector(origin);
    return originConnector.getConfig(searchKey, p);
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


async function getDocument(origin, originId) {
    const connector = getConnector(origin);
    return await connector.getDocument(originId);
}

async function getDocumentByDoi(origin, doi) {
    const connector = getConnector(origin);
    const config = connector.getSingleSearchConfig({doi: doi});
    const res = await getExtractTransformDocuments(config);

    if (!res.count)
        return false;

    return res.items[0];
}

async function getExtractTransformDocuments(config) {
    let res;
    try {
        res = await makeRequest(config);
    } catch (e) {
        sails.log.debug('getExtractTransformDocuments');
        sails.log.debug(e);
    }
    const extracted = config.fieldExtract(res.body);
    return {
        items: await Promise.all(_.map(extracted.documents, r => config.transform(r))),
        count: extracted.count
    };
}

function getConnector(origin) {
    const connectors = {};
    connectors[DocumentOrigins.PUBLICATIONS] = PublicationsConnector;
    connectors[DocumentOrigins.ORCID] = OrcidConnector;
    connectors[DocumentOrigins.SCOPUS] = ScopusConnector;

    return connectors[origin];
}