
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
    tableName: 'documentsuggestiongroup',
    autoUpdatedAt: false,
    autoCreatedAt: false

};