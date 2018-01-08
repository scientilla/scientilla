/**
 * AllPublicationGroup.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        document: {
            model: 'document',
            primaryKey: true
        },
        researchEntity: {
            model: 'group',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'allpublicationgroup',
    autoUpdatedAt: false,
    autoCreatedAt: false
};

