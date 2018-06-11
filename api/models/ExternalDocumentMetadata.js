/* global sails, DocumentOrigins, ExternalDocumentMetadata */

module.exports = {
    attributes: {
        origin: 'STRING',
        origin_id: 'STRING',
        data: 'JSON'
    },
    setData: async function (origin, originId, key, value) {
        const metaData = await ExternalDocumentMetadata.findOne({
            origin: origin,
            origin_id: originId
        });

        if (!metaData)
            return await ExternalDocumentMetadata.create({
                origin: origin,
                origin_id: originId,
                data: {[key]: value}
            });

        metaData.data[key] = value;
        await ExternalDocumentMetadata.update({id: metaData.id}, metaData);
    }
};