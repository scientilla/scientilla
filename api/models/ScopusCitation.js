module.exports = {
    attributes: {
        document: {
            model: 'document',
            primaryKey: true
        },
        citation: {
            model: 'citation',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'scopuscitation',
    autoUpdatedAt: false,
    autoCreatedAt: false
};