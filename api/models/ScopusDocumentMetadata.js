module.exports = {
    attributes: {
        document: {
            model: 'document',
            unique: true
        },
        data: 'JSON'

    },
    migrate: 'safe',
    tableName: 'scopusdocumentmetadata',
    autoUpdatedAt: false,
    autoCreatedAt: false
};