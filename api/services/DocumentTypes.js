/* global DocumentTypes*/
// DocumentTypes.js - in api/services

"use strict";

const documentTypes = {};

module.exports = {
    ARTICLE: 'article',
    ARTICLE_IN_PRESS: 'article_in_press',
    ABSTRACT_REPORT: 'abstract_report',
    BOOK: 'book',
    BOOK_CHAPTER: 'book_chapter',
    CONFERENCE_PAPER: 'conference_paper',
    CONFERENCE_REVIEW: 'conference_review',
    EDITORIAL: 'editorial',
    ERRATUM: 'erratum',
    INVITED_TALK: 'invited_talk',
    LETTER: 'letter',
    NOTE: 'note',
    REPORT: 'report',
    REVIEW: 'review',
    SHORT_SURVEY: 'short_survey',
    PHD_THESIS: 'phd_thesis',
    POSTER: 'poster',
    init: async () => {
        const documentTypesArray = await DocumentType.find();
        documentTypesArray.forEach(dt => {
            documentTypes[dt.id] = dt;
            documentTypes[dt.key] = dt;
        });
    },
    get: () => documentTypes,
    getDocumentType: (id) => documentTypes[id]
};