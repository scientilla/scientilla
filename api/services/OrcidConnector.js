/* global sails,Source */
"use strict";

const request = require('request-promise');
const _ = require('lodash');
const SourceTypes = require("./SourceTypes");
const DocumentTypes = require("./DocumentTypes");

module.exports = {
    getConfig: function (orcidId, params) {
        return {
            reqParams: {
                uri: 'http://pub.orcid.org/' + orcidId + '/orcid-works',
                headers: {
                    'Accept': 'application/json'
                },
                /*Pagination does not work in this way*/
                qs: {
                    limit: params.limit,
                    skip: params.skip
                },
                json: true

            },
            fieldExtract: res => {
                /* Fake pagination: To be fixed */
                const allDocuments = _.get(res, 'orcid-profile.orcid-activities.orcid-works.orcid-work');
                const sortedDocuments = _.orderBy(allDocuments, ['publication-date.year.value'], ['desc']);
                const documents = _.slice(sortedDocuments, params.skip, params.skip + params.limit);
                const count = allDocuments.length;
                return {documents, count};
            },
            transform: d => {
                function getAttributeFromCitation(d, attribute) {
                    const citationData = _.get(d, 'work-citation.citation', '');
                    const regex = new RegExp(attribute + '\\s=\\s{(.*?)}');
                    return _.get(citationData.match(regex), '[1]');
                }

                function getExternalId(d, attributeName) {
                    return _.get(
                        _.find(_.get(d, 'work-external-identifiers.work-external-identifier'),
                            function (wei) {
                                return wei['work-external-identifier-type'] === attributeName;
                            }),
                        'work-external-identifier-id.value'
                    );
                }

                const sourceTypeMappings = {
                    JOURNAL_ARTICLE: SourceTypes.JOURNAL,
                    CONFERENCE_PAPER: SourceTypes.CONFERENCE,
                    BOOK: SourceTypes.BOOK
                };
                const sourceType = sourceTypeMappings[d['work-type']];
                const newDoc = {
                    title: _.get(d, 'work-title.title.value'),
                    authorsStr: _.map(_.get(d, 'work-contributors.contributor'), function (c) {
                        const authorStr = _.get(c, 'credit-name.value');
                        return authorStr.replace(/,/g, '');
                    }).join(', '),
                    year: _.get(d, 'publication-date.year.value'),
                    volume: getAttributeFromCitation(d, 'volume'),
                    issue: getAttributeFromCitation(d, 'number'),
                    pages: getAttributeFromCitation(d, 'pages'),
                    doi: getExternalId(d, 'DOI'),
                    scopusId: _.trimStart(getExternalId(d, 'EID'), '2-s2.0-'),
                    wodId: _.trimStart(getExternalId(d, 'OTHER_ID'), 'WOS:'),
                    sourceType: sourceType
                };
                const newSource = {
                    type: sourceType,
                    title: getAttributeFromCitation(d, 'journal') || _.get(d, 'journal-title.value'),
                    issn: getExternalId(d, 'ISSN'),
                    isbn: getExternalId(d, 'ISBN'),
                };

                return mergeDocAndSource(newDoc, newSource);
            }
        };
    }
};

async function mergeDocAndSource(newDoc, newSource) {
    if (!newSource.title)
        return newDoc;

    const source = await Source.findOneByTitle(newSource.title);
    newDoc.source = source ? source : newSource;
    return newDoc;
}