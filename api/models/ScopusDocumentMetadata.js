module.exports = {
    attributes: {
        document: {
            model: 'document',
            unique: true
        },
        scopusId: {
            tyoe: 'STRING',
            columnName: 'scopus_id'
        },
        data: 'JSON'

    },
    migrate: 'safe',
    tableName: 'scopus_document_metadata',
    autoUpdatedAt: false,
    autoCreatedAt: false
};