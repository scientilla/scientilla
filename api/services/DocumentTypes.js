/* global SourceType*/
// DocumentTypes.js - in api/services

"use strict";

let documentTypes = [];

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
    get: async function () {
        if (!documentTypes.length)
            documentTypes = await DocumentType.find();

        return documentTypes;
    }
};