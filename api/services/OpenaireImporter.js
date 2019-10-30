/* global sails, ExternalDocumentMetadata, DocumentOrigins */
// ScopusExternalImporter.js - in api/services

"use strict";

const request = require('requestretry');
const _ = require('lodash');
const XML = require('pixl-xml');

const openaireConfig = sails.config.connectors.openaire;

module.exports = {
    updateMetadata,
    updateAllMetadata: async () => {
        const DOIs = await Document.getDOIs();
        await importAll(DOIs);
    }
};

async function importAll(inDOIs) {
    const DOIs = Array.isArray(inDOIs) ? inDOIs : [inDOIs];
    const parallelRequests = 200;
    const errors = [];
    const done = [];

    for (let i = 0; i < DOIs.length; i += parallelRequests) {
        await Promise.all(DOIs.slice(i, i + parallelRequests).map(
            doi => updateMetadata(doi)
                .then(res => done.push(res.metaData))
                .catch(err => errors.push(err))
        ));
    }

    sails.log.info('done: ' + done.length);
    sails.log.info('errors: ');
    sails.log.info(errors.reduce((res, err) => {
        if (!res[err.message]) res[err.message] = {count: 0, DOIs: []};
        res[err.message].count++;
        res[err.message].DOIs.push(err.doi);

        return res;
    }, {}));
}

async function updateMetadata(doi) {
    try {
        const metaData = await getMetadata(doi);

        for (const key of Object.keys(metaData))
            await ExternalDocumentMetadata.setData(DocumentOrigins.OPENAIRE, doi, key, metaData[key]);

        return {metaData, done: true};
    } catch (e) {
        throw {...e, done: false};
    }
}

async function getMetadata(doi) {
    const requestParams = getRequestParams({doi: doi});

    let res;
    try {
        res = await request.get(requestParams);
    } catch (err) {
        throw {
            doi: doi,
            message: 'Openaire data request failed.',
            error: err.error
        };
    }

    try {
        return extractData(res.body);
    } catch (err) {
        throw {
            doi: doi,
            message: 'Openaire data failed to parse XML.',
            xml: res.body,
            error: err
        };
    }
}

function getRequestParams(qs = {}, headers = {}) {
    return {
        uri: openaireConfig.url,
        headers: headers,
        qs: qs,
        fullResponse: true,
        maxAttempts: 5,
        retryDelay: 500
    }
}

function extractData(xml) {
    const openaireDocument = XML.parse(xml);

    const totalFound = openaireDocument.header.total;
    if (totalFound === 0) return {};

    const results = _.castArray(openaireDocument.results.result);

    const data = {
        links: [],
        projects: []
    };

    results.forEach((result => {
        data.links = data.links.concat(getLinks(result));
        data.projects = data.projects.concat(getProjects(result));
    }));

    if (data.links.length === 0)
        delete data.links;
    if (data.projects.length === 0)
        delete data.projects;

    return data;
}

function getLinks(result) {
    const path = 'metadata.oaf:entity.oaf:result.children.instance';
    if (!_.get(result, path)) return [];

    const rawLinks = _.castArray(_.get(result, path));
    return rawLinks.map(link => {
        const urls = link.webresource.url ? [link.webresource.url] : link.webresource.map(wr => wr.url);
        return {
            collectedFrom: link.collectedfrom.name,
            hostedBy: link.hostedby.name,
            accessRight: link.accessright.classid,
            urls: urls
        };
    });
}

function getProjects(result) {
    const path = 'metadata.oaf:entity.oaf:result.rels.rel';
    if (!_.get(result, path)) return [];

    const rawProjects = _.castArray(_.get(result, path))
        .filter(p => p.to.type === 'project');

    if (rawProjects.length === 0) return [];

    return rawProjects.map(project => ({
            acronym: project.acronym,
            title: project.title,
            code: project.code,
            funder: project.funding.funder.name,
            funding: project.funding.funding_level_0 ? project.funding.funding_level_0.name : null
        })
    );
}