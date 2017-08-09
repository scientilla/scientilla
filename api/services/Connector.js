/* global sails, PublicationsConnector, OrcidConnector, ScopusConnector, DocumentOrigins */
"use strict";

const request = require('requestretry');
const _ = require('lodash');
const Promise = require("bluebird");

module.exports = {
    getDocuments,
    getConfig,
    makeRequest
};

async function getDocuments(origin, searchKey, params) {
    const reqConfig = await getConfig(origin, searchKey, params);
    let res = await makeRequest(reqConfig);
    const extracted = reqConfig.fieldExtract(res.body);
    const documents = await Promise.all(_.map(extracted.documents, r => reqConfig.transform(r)));

    res = {
        items: documents,
        count: extracted.count
    };

    return res;
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

function getConnector(origin) {
    const connectors = {};
    connectors[DocumentOrigins.PUBLICATIONS] = PublicationsConnector;
    connectors[DocumentOrigins.ORCID] = OrcidConnector;
    connectors[DocumentOrigins.SCOPUS] = ScopusConnector;

    return connectors[origin];
}