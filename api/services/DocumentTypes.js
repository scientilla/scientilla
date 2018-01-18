/* global DocumentTypes*/
// DocumentTypes.js - in api/services

"use strict";

let documentTypes = [];

module.exports = {
    init: async () => {
        documentTypes = await DocumentType.find();
        documentTypes.forEach(dt => DocumentTypes[dt.key.toLocaleUpperCase()] = dt);
    },
    get: () => documentTypes
};