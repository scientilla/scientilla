/**
 * DocumentDuplicate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        duplicate: {
            model: 'document',
            primaryKey: true
        },
        document: {
            model: 'document',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'documentduplicate',
    autoUpdatedAt: false,
    autoCreatedAt: false
};

