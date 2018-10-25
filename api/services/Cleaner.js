/* global User, Institute, Affiliation, Source, Group, Authorship, DocumentKinds, DocumentNotDuplicate, DocumentNotDuplicateGroup*/

"use strict";

module.exports = {
    cleanDocumentCopies,
    cleanInstituteCopies,
    cleanSourceCopies
};

async function cleanInstituteCopies() {
    function getInstituteCopy(i) {
        return Institute.findOne({id: {'<': i.id}, scopusId: i.scopusId});
    }

    function getInstituteParent(i) {
        return Institute.findOne({id: i.parentId});
    }

    // bad hack: Institute 1 is the main institute
    const mainInstituteId = 1;
    const allInstitutes = await Institute.find({id: {'!': mainInstituteId}, scopusId: {'!': null}});
    const institutes = allInstitutes.filter(i => i.scopusId);
    sails.log.info(`${institutes.length} institutes to check`);
    const deletedInstitutes = [];
    for (let institute of institutes) {
        const copy = await getInstituteCopy(institute);
        if (!copy)
            continue;

        const affiliations = await Affiliation.find({institute: institute.id});
        if (affiliations.length) {
            const affiliationsIds = affiliations.map(a => a.id);
            const updateAffiliations = await Affiliation.update({id: affiliationsIds}, {institute: copy.id});
            sails.log.info(`${updateAffiliations.length} affiliations updated from institute ${institute.id} to ${copy.id}`);
        }
        await institute.destroy();
        deletedInstitutes.push(institute);
    }
    sails.log.info(`${deletedInstitutes.length} deleted`);

    const institutesDup = await Institute.find({id: {'!': mainInstituteId}, parentId: {'!': null}});
    for (let institute of institutesDup) {
        const parent = await getInstituteParent(institute);
        if (!parent)
            continue;

        const affiliations = await Affiliation.find({institute: institute.id});
        if (affiliations.length) {
            const affiliationsIds = affiliations.map(a => a.id);
            const updateAffiliations = await Affiliation.update({id: affiliationsIds}, {institute: parent.id});
            sails.log.info(`${updateAffiliations.length} affiliations updated from institute ${institute.id} to ${parent.id}`);
        }
    }

}

async function cleanSourceCopies() {
    const sources = await Source.find();
    let deletedSourceIds = [];
    let updatedSourceIds = [];
    sails.log.info(`${sources.length} sources to check`);
    for (const [i, source] of sources.entries()) {
        if (updatedSourceIds.includes(source.id) || deletedSourceIds.includes(source.id))
            continue;

        const copies = Source.searchCopies(source, sources, i);
        if (!copies.length)
            continue;

        const deleted = await Source.merge(source, copies);
        if (deleted) {
            deletedSourceIds.push(...deleted.map(s => s.id));
            updatedSourceIds.push(source.id);
        }
    }
    sails.log.info(`${updatedSourceIds.length} updated`);
    sails.log.info(`${deletedSourceIds.length} deleted`);
}

async function cleanDocumentCopies() {
    const mergedDocuments = [];
    const nonMergedDocuments = [];
    const nonConnectedDocuments = [];
    const documents = await Document.find({kind: DocumentKinds.VERIFIED});
    sails.log.info(`${documents.length} documents to check found`);

    for (let partialDoc of documents) {

        const doc = await Document.findOneById(partialDoc.id)
            .populate('authors')
            .populate('groups')
            .populate('authorships')
            .populate('groupAuthorships')
            .populate('affiliations')
            .populate('discarded')
            .populate('discardedG');
        if (Document.getNumberOfConnections(doc) === 0) {
            sails.log.warn(`Document with id ${doc.id} is a verified document but has no connections`);
            nonConnectedDocuments.push(doc);
            continue;
        }
        let errors = [];
        const copies = await Document.findCopies(doc, null);
        if (copies.length === 0) continue;
        const copy = copies[0];

        sails.log.info(`Trying to merge document ${doc.id} with ${copy.id} (${doc.title}) ------------`);

        try {
            await Document.update({id: doc.id}, {kind: DocumentKinds.IGNORED});
            const researchEntities = doc.authors
                .map(a => Object.assign({}, a, {Model: User}))
                .concat(doc.groups.map(g => Object.assign({}, g, {Model: Group})));

            const mergeResult = await mergeDocuments(researchEntities, doc);
            errors = errors.concat(mergeResult.errors);


            if (mergeResult.done.length === researchEntities.length) {
                const moveUserDiscardedErrors = await moveDiscarded(User, doc, copy, 'discarded');
                const moveGroupDiscardedErrors = await moveDiscarded(Group, doc, copy, 'discardedG');
                errors = errors.concat(moveUserDiscardedErrors);
                errors = errors.concat(moveGroupDiscardedErrors);

                const moveNotDuplicatesErorrs = await moveNotDuplicates(doc, copy);
                errors = errors.concat(moveNotDuplicatesErorrs);
            }

            const unverifyResults = await unverifyDocuments(mergeResult.done, doc);
            errors = errors.concat(unverifyResults.errors);

            if (errors.length) {
                sails.log.info(`Document ${doc.id} should have been merged with ${copy.id} but errors occured`);
                await Document.update({id: doc.id}, {kind: DocumentKinds.VERIFIED});
                nonMergedDocuments.push({doc: doc, copy: copy});
            }
            else {
                sails.log.info(`Document ${doc.id} was merged with ${copy.id} -------------------------`);
                mergedDocuments.push({doc: doc, copy: copy});
            }
        } catch (e) {
            sails.log.info(`An error occurred trying to merge ${doc.id} with ${copy.id}:`);
            sails.log.info(e);
            await Document.update({id: doc.id}, {kind: DocumentKinds.VERIFIED});
        }
    }
    sails.log.info(`${mergedDocuments.length} documents merged`);
    sails.log.info(`${nonMergedDocuments.length} documents were not merged because of some error`);
    sails.log.info(`${nonConnectedDocuments.length} documents were not connected to any research entity in any way`);
}


async function mergeDocuments(researchEntities, document) {

    const out = {
        errors: [],
        done: []
    };

    for (const re of researchEntities) {
        sails.log.info(`${re.Model.adapter.identity} ${re.id}:${re.name + (re.surname ? ' ' + re.surname : '')} is trying to verify`);
        const authorshipData = getAuthorshipData(re, document);
        const draft = await re.Model.copyDocument(re.Model, re.id, document.id);
        const res = await re.Model.verifyDraft(re.Model, re.id, draft.id, authorshipData, false);
        if (res.error) {
            await Document.destroy(draft);
            out.errors.push(res);
            sails.log.warn('Error: ' + res.error);
        }
        else out.done.push(re);
    }

    return out;
}

function getAuthorshipData(re, document) {
    if (re.Model.adapter.identity === 'group') return {};

    const authorship = document.authorships.find(a => a.researchEntity === re.id);
    const instituteIds = document.affiliations.filter(aff => aff.authorship === authorship.id).map(aff => aff.institute);
    const authorshipData = Authorship.filterFields(authorship);
    authorshipData.affiliationInstituteIds = instituteIds;
    return authorshipData;
}

async function unverifyDocuments(researchEntities, document) {

    const out = {
        errors: [],
        done: []
    };

    for (const re of researchEntities) {
        sails.log.info(`${re.Model.adapter.identity} ${re.id}:${re.name + (re.surname ? ' ' + re.surname : '')} is trying to unverify`);

        const res = await re.Model.unverifyDocument(re.Model, re.id, document.id);
        if (res.error) {
            out.errors.push(res);
            sails.log.warn('Error: ' + res.error);
        }
        else out.done.push(re);
    }

    return out;
}


async function moveDiscarded(ResearchEntityModel, document, copy, discadedKey) {
    const errors = [];
    for (let discarded of document[discadedKey]) {
        const user = await ResearchEntityModel.findOne({id: discarded.researchEntity}).populate('documents', {id: copy.id});
        if (user.documents.length > 0)
            sails.log.info(`${ResearchEntityModel.adapter.identity} ${discarded.researchEntity} is not discarding document because he has already verified it`);
        else {
            sails.log.info(`${ResearchEntityModel.adapter.identity} ${discarded.researchEntity} is discarding document`);
            const res = await ResearchEntityModel.discardDocument(ResearchEntityModel, discarded.researchEntity, copy.id);

            if (res.error) {
                errors.push(res);
                sails.log.warn('Error: ' + res.error);
                continue;
            }
        }

        sails.log.info(`${ResearchEntityModel.adapter.identity} ${discarded.researchEntity} is removing ${document.id} from the discarded`);
        const res2 = await ResearchEntityModel.undiscardDocument(ResearchEntityModel, discarded.researchEntity, discarded.document);
        if (res2.error) {
            errors.push(res2);
            sails.log.warn('Error: ' + res2.error);
        }
    }

    return errors;
}

async function moveNotDuplicates(document, copy) {
    const errors = [];
    const userDocumentNotDuplicates = await DocumentNotDuplicate.find({
        or: [
            {document: document.id},
            {duplicate: document.id}
        ]
    }).populate('researchEntity');
    const userCopyNotDuplicates = await DocumentNotDuplicate.find({
        or: [
            {document: copy.id},
            {duplicate: copy.id}
        ]
    }).populate('researchEntity');

    const groupDocumentNotDuplicates = await DocumentNotDuplicateGroup.find({
        or: [
            {document: document.id},
            {duplicate: document.id}
        ]
    }).populate('researchEntity');
    const groupCopyNotDuplicates = await DocumentNotDuplicateGroup.find({
        or: [
            {document: copy.id},
            {duplicate: copy.id}
        ]
    }).populate('researchEntity');

    const documentNotDuplicates = userDocumentNotDuplicates.concat(groupDocumentNotDuplicates);
    const copyNotDuplicates = userCopyNotDuplicates.concat(groupCopyNotDuplicates);

    for (const dnd of documentNotDuplicates) {
        const otherDocumentId = dnd.document === document.id ? dnd.duplicate : dnd.document;
        sails.log.info(`${dnd.researchEntity.getModel().adapter.identity} ${dnd.researchEntity.id} has a documentNotDuplicate to update: ${document.id}-${otherDocumentId} to ${copy.id}-${otherDocumentId}`);

        const NotDuplicateModel = dnd.researchEntity.getDocumentNotDuplicateModel();
        let res = await NotDuplicateModel.destroy({id: dnd.id});
        if(!res.error){
            errors.push(res);
            sails.log.warn('Error: ' + res.error);
        }

        if (otherDocumentId === copy.id) {
            sails.log.info(`The documentNotDuplicate has been deleted because ${otherDocumentId} is the merging document`);
            continue;
        }

        if (copyNotDuplicates.find(cnd => cnd.researchEntity.compareId(dnd.researchEntity) &&
            (cnd.document === otherDocumentId || cnd.duplicate === otherDocumentId))) {
            sails.log.info(`The documentNotDuplicate has been deleted because the merging document (${copy.id}) already has ${otherDocumentId} signed as not duplicate`);
            continue;
        }

        res = await NotDuplicateModel.insert(document, copy, dnd.researchEntity);
        if(res.error){
            errors.push(res);
            sails.log.warn('Error: ' + res.error);
        }
    }


    return errors;
}