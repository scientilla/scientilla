/* global SourceType*/
// SourceTypes.js - in api/services

"use strict";

const sourceTypesData = require('../dataInit/sourceType.json').values;
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
    init: async () => {
        sourceTypes = await SourceType.find();
        if (!sourceTypes.length)
            sourceTypes = await SourceType.create(sourceTypesData);
    },
    get: () => sourceTypes
}
;