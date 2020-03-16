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
    tableName: 'favoritedocument',
    autoUpdatedAt: false,
    autoCreatedAt: false
};