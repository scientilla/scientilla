
module.exports = {
    attributes: {
        document: {
            model: 'reference',
            primaryKey: true
        },
        researchEntity: {
            model: 'user',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'documentsuggestion',
    autoUpdatedAt: false,
    autoCreatedAt: false

};