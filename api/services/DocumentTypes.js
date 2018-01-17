/* global DocumentTypes*/
// DocumentTypes.js - in api/services

"use strict";

let documentTypes = [];

module.exports = {
    ARTICLE: {},
    ARTICLE_IN_PRESS: {},
    ABSTRACT_REPORT: {},
    BOOK: {},
    BOOK_CHAPTER: {},
    CONFERENCE_PAPER: {},
    CONFERENCE_REVIEW: {},
    EDITORIAL: {},
    ERRATUM: {},
    INVITED_TALK: {},
    LETTER: {},
    NOTE: {},
    REPORT: {},
    REVIEW: {},
    SHORT_SURVEY: {},
    PHD_THESIS: {},
    POSTER: {},
    init: async () => {
        documentTypes = await DocumentType.find();
        documentTypes.forEach(dt => DocumentTypes[dt.key.toLocaleUpperCase()] = dt);
    },
    get: () => documentTypes
};