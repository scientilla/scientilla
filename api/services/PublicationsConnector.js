/* global sails,Source */
"use strict";

const request = require('request-promise');
const _ = require('lodash');
const SourceTypes = require("./SourceTypes");
const DocumentTypes = require("./DocumentTypes");

module.exports = {
    getConfig
};

function getConfig(publicationsKey, params) {
    const query = {};
    if (params.type === 'author')
        query['author-email'] = publicationsKey;
    else
        query['research-structure'] = publicationsKey;

    let qs = {
        limit: params.limit,
        skip: params.skip
    };
    qs = _.merge(qs, query);

    return {
        reqParams: {
            uri: 'http://backend.publications.iit.it/api/publications/getMatchingOnesAsJsonData',
            qs: qs,
            json: true
        },
        fieldExtract: res => ({
            documents: _.get(res, 'data'),
            count: _.get(res, 'items_count')
        }),
        transform: d => {
            let sourceType;
            if (d.conference)
                sourceType = SourceTypes.CONFERENCE;
            else if (d.journal)
                sourceType = SourceTypes.JOURNAL;
            else if (d.bookTitle)
                sourceType = SourceTypes.BOOK;
            else
                sourceType = null;

            const typeMappings = {
                bookwhole: DocumentTypes.BOOK.key,
                bookchapter: DocumentTypes.BOOK_CHAPTER.key,
                fullpapervolumeatreferredconference: DocumentTypes.CONFERENCE_PAPER.key,
                shortpaperabstractatrefereedconference: DocumentTypes.ABSTRACT_REPORT.key,
                nationaljournal: DocumentTypes.ARTICLE.key,
                internationaljournal: DocumentTypes.ARTICLE.key,
                correction: DocumentTypes.ERRATUM.key,
                editorial: DocumentTypes.EDITORIAL.key,
                supplementaryinformation: DocumentTypes.NOTE.key,
                talk: DocumentTypes.INVITED_TALK.key
            };
            const documentType = d.typeAlias in typeMappings ? typeMappings[d.typeAlias] : null;
            const authors = d.authors ? d.authors : '';
            const newDoc = {
                title: d.title,
                authorsStr: authors.replace(/\*/g, ''),
                year: d.year,
                doi: d.doi,
                volume: d.volume,
                issue: d.issue,
                pages: /^\d+-\d+$/.test(d.pages) ? d.pages : '',
                articleNumber: '',
                sourceType: sourceType,
                type: documentType,
                iitPublicationsId: d.id
            };

            //TODO accrocchio mainInstituteId assumed equal 1
            const mainInstituteId = 1;
            newDoc.authorships = d.authors.split(',').map((author, i) => {
                    const affiliations = author.includes('*') ? [mainInstituteId] : [];
                    return {
                        position: i,
                        corresponding: false,
                        affiliations: affiliations
                    }
                }
            );

            if (documentType === DocumentTypes.INVITED_TALK.key) {
                newDoc.sourceType = null;
                newDoc.itSource = d.publication;
                return newDoc;
            }

            const newSource = {
                title: d.journal || d.conference || d.bookTitle,
                publisher: d.publisher,
                acronym: d.conferenceAcronym,
                location: d.conferencePlace,
                type: sourceType
            };
            return mergeDocAndSource(newDoc, newSource);
        }
    };
}

async function mergeDocAndSource(newDoc, newSource) {
    if (!newSource.title)
        return newDoc;

    const source = await Source.findOneByTitle(newSource.title);
    newDoc.source = source ? source : newSource;
    return newDoc;
}