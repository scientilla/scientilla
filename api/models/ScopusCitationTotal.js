module.exports = {
    attributes: {
        document: {
            model: 'document',
            primaryKey: true
        },
        citations: 'integer'
    },

    migrate: 'safe',
    tableName: 'scopuscitationtotal',
    autoUpdatedAt: false,
    autoCreatedAt: false
};