// DocumentMerger.js - in api/services

const _ = require('lodash');

"use strict";

module.exports = {
    mergeDocuments
};

async function getAllVerifiedDocuments() {
    // waterline goes crazy when find returns more than 6200 elements
    // https://github.com/balderdashy/waterline/issues/1498
    const chunkSize = 1000;
    const documents = [];
    let chunkedDocuments;
    let skip = 0;
    let limit = chunkSize;
    let keepLoading = true;
    while (keepLoading) {
        chunkedDocuments = await Document.find({where: {kind: DocumentKinds.VERIFIED}, skip: skip, limit: limit})
            .populate('authorships')
            .populate('groupAuthorships')
            .populate('affiliations')
            .populate('discarded')
            .populate('discardedG');
        skip+=chunkSize;
        limit+= chunkSize;
        documents.push(...chunkedDocuments);
        if (chunkedDocuments.length == 0)
            keepLoading = false;
    }
    return documents;
}

//missing check of discarded documents
async function mergeDocuments() {
    const mergedDocuments = [];
    const nonMergedDocuments = [];
    const documents = await getAllVerifiedDocuments();
    sails.log.debug(`${documents.length} documents to check found`);

    for (let doc of documents) {
        if (doc.authorships.length == 0 && doc.groupAuthorships.length == 0) {
            sails.log.warn(`Document with id ${doc.id} is a verified document but has no authorships`);
            continue;
        }
        const errors = [];
        const copies = await Document.findCopies(doc);
        if (copies.length == 0)
            continue;
        const copy = copies[0];
        for (let d of doc.discarded) {
            await Discarded.destroy({id: d.id});
            await User.discardDocument(d.researchEntity, d.document);
        }
        for (let d of doc.discardedG) {
            await Discarded.destroy({id: d.id});
            await Group.discardDocument(d.researchEntity, d.document);
        }
        for (let a of doc.authorships) {
            if (!a.researchEntity)
                continue;
             const instituteIds = doc.affiliations.filter(aff => aff.authorship == a.id).map(aff => aff.institute);
            const res = await User.verifyDocument(User, a.researchEntity, copy.id, a.position, instituteIds, a.corresponding);
            if (res.error) {
                errors.push(res);
                sails.log.warn(`User ${a.researchEntity} was trying to verify document ${copy.id} (${doc.title}) in position: ${a.position}, but an error occured`);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            } else
                await User.unverifyDocument(User, a.researchEntity, doc.id);
        }
        for (let a of doc.groupAuthorships) {
            if (!a.researchEntity)
                continue;
            const res = await Group.verifyDocument(Group, a.researchEntity, copy.id, null, null, null);
            if (res.error) {
                errors.push(res);
                sails.log.warn(`Group ${a.researchEntity} was trying to verify document ${copy.id} (${doc.title}), but an error occured`);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            } else
                await Group.unverifyDocument(Group, a.researchEntity, doc.id);
        }
        if (errors.length)
            nonMergedDocuments.push(doc);
        else
            mergedDocuments.push(doc);
    }
    sails.log.debug(`${mergedDocuments.length} documents merged`);
    sails.log.debug(`${nonMergedDocuments.length} documents were not merged because of some error`);
}