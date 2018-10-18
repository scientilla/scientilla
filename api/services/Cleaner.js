/* global User, Institute, Affiliation, Source, Group, Authorship, DocumentKinds*/

const _ = require('lodash');

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
    for (let source of sources) {
        if (updatedSourceIds.includes(source.id) || deletedSourceIds.includes(source.id))
            continue;

        const copies = await Source.searchCopies(source);
        if (!copies.length)
            continue;

        const deleted = await Source.merge(source, copies);
        if (deleted) {
            deletedSourceIds = deletedSourceIds.concat(deleted.map(s => s.id));
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
    const documents = await Document.findByKind(DocumentKinds.VERIFIED);
    sails.log.info(`${documents.length} documents to check found`);

    for (let partialDoc of documents) {

        const doc = await Document.findOneById(partialDoc.id)
            .populate('authors')
            .populate('groups')
            .populate('authorships')
            .populate('groupAuthorships')
            .populate('affiliations')
            .populate('discardedCoauthors')
            .populate('discardedGroups')
            .populate('discarded')
            .populate('discardedG');
        if (Document.getNumberOfConnections(doc) === 0) {
            sails.log.warn(`Document with id ${doc.id} is a verified document but has no connections`);
            nonConnectedDocuments.push(doc);
            continue;
        }
        let errors = [];
        const copies = await Document.findCopies(doc, null, false);
        if (copies.length === 0) {
            continue;
        }
        const copy = copies[0];
        const moveUserDiscardedErrors = await moveDiscarded(User, doc, copy, 'discarded');
        const moveGroupDiscardedErrors = await moveDiscarded(Group, doc, copy, 'discardedG');
        errors = errors.concat(moveUserDiscardedErrors);
        errors = errors.concat(moveGroupDiscardedErrors);

        for (let a of doc.authorships) {
            if (!a.researchEntity)
                continue;
            const instituteIds = doc.affiliations.filter(aff => aff.authorship === a.id).map(aff => aff.institute);
            sails.log.info(`User ${a.researchEntity} is trying to verify document ${copy.id} (${copy.title}) in position: ${a.position}`);
            const authorshipData = Authorship.filterFields(a);
            authorshipData.affiliationInstituteIds = instituteIds;
            const res = await User.verifyDocument(User, a.researchEntity, copy.id, authorshipData, false);
            if (res.error) {
                errors.push(res);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            } else {
                sails.log.info(`User ${a.researchEntity} is trying to unverify document ${doc.id} (${doc.title})`);
                const res2 = await User.unverifyDocument(User, a.researchEntity, doc.id);
                if (res2.error) {
                    errors.push(res2);
                    sails.log.warn('Error: ');
                    sails.log.warn(res2.error);
                }
            }
        }
        for (let a of doc.groupAuthorships) {
            if (!a.researchEntity)
                continue;
            sails.log.info(`Group ${a.researchEntity} is trying to verify document ${copy.id} (${copy.title})`);
            const res = await Group.verifyDocument(Group, a.researchEntity, copy.id, {}, false);
            if (res.error) {
                errors.push(res);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            } else {
                sails.log.info(`Group ${a.researchEntity} is trying to unverify document ${doc.id} (${doc.title})`);
                const res2 = await Group.unverifyDocument(Group, a.researchEntity, doc.id);
                if (res2.error) {
                    errors.push(res2);
                    sails.log.warn('Error: ');
                    sails.log.warn(res2.error);
                }
            }
        }
        if (errors.length) {
            sails.log.info(`Document ${doc.id} should have been merged with  ${copy.id} but an error occured`);
            nonMergedDocuments.push({doc: doc, copy: copy});
        }
        else {
            sails.log.info(`Document ${doc.id} was merged with ${copy.id}`);
            mergedDocuments.push({doc: doc, copy: copy});
        }
    }
    sails.log.info(`${mergedDocuments.length} documents merged`);
    sails.log.info(`${nonMergedDocuments.length} documents were not merged because of some error`);
    sails.log.info(`${nonConnectedDocuments.length} documents were not connected to any research entity in any way`);
}

async function moveDiscarded(ResearchEntityModel, document, copy, discadedKey) {
    const errors = [];
    for (let discarded of document[discadedKey]) {
        const user = await ResearchEntityModel.findOne({id: discarded.researchEntity}).populate('documents');
        if (user.documents.map(d => d.id).includes(copy.id))
            sails.log.info(`${ResearchEntityModel.adapter.identity} ${discarded.researchEntity} is not discarding document ${copy.id} (${copy.title}) because he has already verified it`);
        else {
            sails.log.info(`${ResearchEntityModel.adapter.identity} ${discarded.researchEntity} is discarding document ${copy.id} (${copy.title})`);
            const res = await ResearchEntityModel.discardDocument(ResearchEntityModel, discarded.researchEntity, copy.id);

            if (res.error) {
                errors.push(res);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
                continue;
            }
        }

        sails.log.info(`${ResearchEntityModel.adapter.identity} ${discarded.researchEntity} is removing ${document.id} from the discarded`);
        const res2 = await ResearchEntityModel.undiscardDocument(ResearchEntityModel, discarded.researchEntity, discarded.document);
        if (res2.error) {
            errors.push(res2);
            sails.log.warn('Error: ');
            sails.log.warn(res2.error);
        }
    }

    return errors;
}