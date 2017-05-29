/* global sails,Source */
"use strict";

const request = require('request-promise');
const _ = require('lodash');
const SourceTypes = require("./SourceTypes");
const DocumentTypes = require("./DocumentTypes");

module.exports = {
    getConfig: function (researchEntity, configQuery) {
        const researchEntityType = researchEntity.getType();
        let query;
        if (researchEntityType === 'user') {
            const opts = {
                'username': {'author-email': researchEntity.username},
                'surname': {author: researchEntity.surname}
            };

            if (configQuery.where.field in opts)
                query = opts[configQuery.where.field];
            else
                throw "ExternalDocument error: field not selected";
        }
        else {
            query = {"research-structure": researchEntity.publicationsAcronym};
        }

        if (configQuery.where.type && configQuery.where.type !== "all")
            query = _.merge({type: configQuery.where.type}, query);

        let qs = {
            limit: configQuery.limit,
            skip: configQuery.skip
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
                    bookwhole: DocumentTypes.BOOK,
                    bookchapter: DocumentTypes.BOOK_CHAPTER,
                    fullpapervolumeatreferredconference: DocumentTypes.CONFERENCE_PAPER,
                    shortpaperabstractatrefereedconference: DocumentTypes.ABSTRACT_REPORT,
                    nationaljournal: DocumentTypes.ARTICLE,
                    internationaljournal: DocumentTypes.ARTICLE,
                    correction: DocumentTypes.ERRATUM,
                    editorial: DocumentTypes.EDITORIAL,
                    supplementaryinformation: DocumentTypes.NOTE,
                    talk: DocumentTypes.INVITED_TALK
                };
                const documentType = d.typeAlias in typeMappings ? typeMappings[d.typeAlias] : null;
                const newDoc = {
                    title: d.title,
                    authorsStr: d.authors.replace(/\*/g, ''),
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

                if (documentType === DocumentTypes.INVITED_TALK) {
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
};


async function mergeDocAndSource(newDoc, newSource) {
    if (!newSource.title)
        return newDoc;

    const source = await Source.findOneByTitle(newSource.title);
    newDoc.source = source ? source : newSource;
    return newDoc;
}