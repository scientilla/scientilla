
module.exports = {
    attributes: {
        document: {
            model: 'document',
            primaryKey: true
        },
        researchEntity: {
            model: 'user',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'externaldocument',
    autoUpdatedAt: false,
    autoCreatedAt: false

};