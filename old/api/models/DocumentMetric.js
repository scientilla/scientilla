module.exports = {
    attributes: {
        document: {
            model: 'document',
            primaryKey: true
        },
        metric: {
            model: 'sourcemetric',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'documentmetric',
    autoUpdatedAt: false,
    autoCreatedAt: false
};