/**
 * DocumentType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        key: 'text',
        shortLabel: 'text',
        label: 'text',
        type: 'text',
        defaultSourceType: {
            model: 'SourceType'
        },
        allowedSourceTypes: {
            collection: 'SourceType',
            via: 'allowedDocumentTypes',
            through: 'documenttypesourcetype'
        },
        documents: {
            collection: 'Document',
            via: 'documenttype'
        }
    }
};

