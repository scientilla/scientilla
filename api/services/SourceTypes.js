/* global SourceType*/
// SourceTypes.js - in api/services

"use strict";

let sourceTypes = [];

module.exports = {
    BOOK: 'book',
    JOURNAL: 'journal',
    CONFERENCE: 'conference',
    SCIENTIFIC_CONFERENCE: 'scientific_conference',
    INSTITUTE: 'institute',
    BOOKSERIES: 'bookseries',
    WORKSHOP: 'workshop',
    SCHOOL: 'school',
    MEDIA: 'media',
    PUBLIC_EVENT: 'public_event',
    OUTREACH: 'outreach',
    get: async function () {
        if (!sourceTypes.length)
            sourceTypes = await SourceType.find();

        return sourceTypes;
    }
};