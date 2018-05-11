/**
 * SourceType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    DEFAULT_SORTING: {
        label: 'asc'
    },

    attributes: {
        key: 'text',
        label: 'text',
        section: 'text',
        type: 'text',
        allowedDocumentTypes: {
            collection: 'DocumentType',
            via: 'allowedSourceTypes',
            through: 'documenttypesourcetype'
        },
        sources: {
            collection: 'Source',
            via: 'sourcetype'
        }
    }
};

