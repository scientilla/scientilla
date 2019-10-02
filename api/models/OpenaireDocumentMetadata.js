module.exports = {
    attributes: {
        document: {
            model: 'document',
            unique: true
        },
        data: 'JSON'

    },
    migrate: 'safe',
    tableName: 'openaire_document_metadata',
    autoUpdatedAt: false,
    autoCreatedAt: false
};