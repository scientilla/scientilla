
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
    tableName: 'externaldocumentgroup',
    autoUpdatedAt: false,
    autoCreatedAt: false

};