/* global DocumentNotDuplicate, DocumentNotDuplicateGroup*/

module.exports = {

    attributes: {
        duplicate: {
            model: 'document'
        },
        document: {
            model: 'document'
        }
    },
    async insert(doc1, doc2, researchEntity) {
        const NotDuplicateModel = researchEntity.getDocumentNotDuplicateModel();
        return await NotDuplicateModel.create({
            document: Math.min(doc1.id, doc2.id),
            duplicate: Math.max(doc1.id, doc2.id),
            researchEntity: researchEntity
        });
    }
};

