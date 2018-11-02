/* global User */
'use strict';

const should = require('should');
const _ = require('lodash');
const test = require('./../helper.js');

describe('Draft Verification', () => {
    before(test.clean);

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData();
    const institutesData = test.getAllInstituteData();
    const sourcesData = test.getAllSourceData();
    const groupsData = test.getAllGroupData();
    const user1Data = usersData[0];
    const user2Data = usersData[1];
    const documentData = documentsData[0];
    const incompleteDocumentData = documentsData[1];
    const iitInstituteData = institutesData[0];
    const unigeInstituteData = institutesData[1];
    const nonExistentDocument = {id: 1000};
    const iitGroupData = groupsData[0];
    let user1;
    let user2;
    let user1Draft1;
    let user1Draft2;
    let user2Draft1;
    let journal;
    let iitGroup;
    const user1Doc1Position = 4;
    const user2Doc1Position = 0;
    let iitInstitute;
    let unigeInstitute;
    let author2affiliationInstitutes;

    it('there should be no verified documents for a new user', async () => {
            user1 = await test.registerUser(user1Data);
            iitGroup = await test.createGroup(iitGroupData);
            iitInstitute = await test.createInstitute(iitInstituteData);
            unigeInstitute = await test.createInstitute(unigeInstituteData);
            journal = await test.createSource(sourcesData[0]);
            const body = await test.getUserDocuments(user1);
            body.should.be.eql(test.EMPTY_RES);
        }
    );

    it('verifying a valid draft should be possible', async () => {
            documentData.source = journal;
            user1Draft1 = await test.userCreateDraft(user1, documentData);
            const affiliations = [iitInstitute.id];
            const doc = await test.userVerifyDraft(user1, user1Draft1, user1Doc1Position, affiliations);
            // expect
            doc.title.should.equal(documentData.title);
            doc.kind.should.be.equal('v');
            should(doc.draftCreator).be.null;

            const userDrafts = await test.getUserDrafts(user1);
            userDrafts.should.be.eql(test.EMPTY_RES);

            const body = await test.getUserDocumentsWithAuthors(user1);
            // expect
            const count = body.count;
            const documents = body.items;
            count.should.be.equal(1);
            documents.should.have.length(1);
            const document = documents[0];
            document.title.should.equal(documentData.title);
            document.kind.should.be.equal('v');
            should(document.draftCreator).be.null;
            document.authors.should.have.length(1);
            document.authors[0].username.should.equal(user1.username);
            document.authorships.should.have.length(5);
            const user1Authorship = document.authorships.find(a => a.position === user1Doc1Position);
            user1Authorship.researchEntity.should.equal(user1.id);
            document.affiliations.should.have.length(1);
            document.affiliations[0].institute.should.equal(iitInstitute.id);
        }
    );

    it('verifying a complete draft twice should give an error', async () => {
            const body = await test.userVerifyDraft(user1, user1Draft1);
            // expect
            body.should.have.property('error');
            body.should.have.property('item');
            should(body.item).be.null;
        }
    );

    it('verifying a non complete draft should not be possible', async () => {
            user1Draft2 = await test.userCreateDraft(user1, incompleteDocumentData);
            const body = await test.userVerifyDraft(user1, user1Draft2, 4, [iitInstitute.id]);
            // expect
            body.should.have.property('error');
            body.should.have.property('item');
            body.item.title.should.equal(incompleteDocumentData.title);

            const userDraftsBody = await test.getUserDrafts(user1);
            // expect
            userDraftsBody.items.should.have.length(1);

            const userDocsBody = await test.getUserDocuments(user1);
            // expect
            userDocsBody.items.should.have.length(1);
        }
    );

    it('verifying a nonexsting document should give an error', async () => {
            const body = await test.userVerifyDraft(user1, nonExistentDocument);
            // expect
            body.should.have.property('error');
            should(body.item).be.null;
        }
    );

    it('verifying two identical documents should merge them', async () => {
            user2 = await test.registerUser(user2Data);
            documentData.source = journal;
            user2Draft1 = await test.userCreateDraft(user2, documentData);
            author2affiliationInstitutes = [unigeInstitute.id, iitInstitute.id];
            const document = await test.userVerifyDraft(user2, user2Draft1, user2Doc1Position, author2affiliationInstitutes);
            // expect
            document.title.should.equal(documentData.title);
            document.kind.should.be.equal('v');
            should(document.draftCreator).be.null;

            const body = await test.getUserDocumentsWithAuthors(user2);
            // expect
            const count = body.count;
            const documents = body.items;
            count.should.be.equal(1);
            documents.should.have.length(1);
            const d = documents[0];
            d.id.should.equal(user1Draft1.id);
            d.title.should.equal(documentData.title);
            d.kind.should.be.equal('v');
            should(d.draftCreator).be.null;
            d.authors[0].username.should.equal(user1.username);
            d.authors[1].username.should.equal(user2.username);
            d.authorships.should.have.length(5);
            const user1Authorship = d.authorships.find(a => a.position === user1Doc1Position);
            const user2Authorship = d.authorships.find(a => a.position === user2Doc1Position);
            user1Authorship.researchEntity.should.equal(user1.id);
            user2Authorship.researchEntity.should.equal(user2.id);
            d.affiliations.should.have.length(3);
            d.affiliations[0].institute.should.equal(iitInstitute.id);
            const author2affiliations = d.affiliations.filter(a => a.authorship === user2Authorship.id);
            const author2affiliationInstitutesActual = _.map(author2affiliations, 'institute');
            author2affiliationInstitutesActual.should.containDeep(author2affiliationInstitutes);

            await test.getDocument(user2Draft1.id, 404);
        }
    );

    it('verifying in bulk should verify only draft with at least an affiliation associated to the user', async () => {
        await test.clean();
        user1 = await test.registerUser(user1Data);
        iitGroup = await test.createGroup(iitGroupData);
        iitInstitute = await test.createInstitute(iitInstituteData);
        unigeInstitute = await test.createInstitute(unigeInstituteData);
        journal = await test.createSource(sourcesData[0]);
        documentsData[2].source = journal;
        documentsData[2].authorships = [{
            position: 1,
            affiliations: [iitInstitute.id, unigeInstitute.id]
        }];
        documentsData[3].source = journal;
        documentsData[3].authorships = [{
            position: 0,
            affiliations: [unigeInstitute.id]
        }];

        documentsData[4].source = journal;
        documentsData[4].authorships = [{
            position: 4,
            affiliations: []
        }];

        const draftsToBeCreated = [
            documentsData[2],
            documentsData[3],
            documentsData[4]
        ];
        const drafts = await test.userCreateDrafts(user1, draftsToBeCreated);
        const body = await test.userVerifyDrafts(user1, drafts);
        // expect
        const verifiedDocuments = body.filter(d => !d.error);
        verifiedDocuments.should.have.length(2);
        const verifiedDocumentsIds = verifiedDocuments.map(d => d.id);
        verifiedDocumentsIds.should.containDeep([drafts[0], drafts[1]].map(d => d.id));
        verifiedDocumentsIds.should.not.containDeep([drafts[2]].map(d => d.id));

        const documentsBody = await test.getUserDocuments(user1);
        // expect
        const count = documentsBody.count;
        const documents = documentsBody.items;
        count.should.be.equal(2);
        documents.should.have.length(2);
        const documentsIds = documents.map(d => d.id);
        documentsIds.should.containDeep([drafts[0], drafts[1]].map(d => d.id));
        documentsIds.should.not.containDeep([drafts[2]].map(d => d.id));
    });


    it('verifying two similar documents should not be possible', async () => {
        documentsData[2].title = 'different title';
        documentsData[2].scopusId = 'no scopus id';
        const draft = await test.userCreateDraft(user1, documentsData[2]);
        const body = await test.userVerifyDraft(user1, draft);
        body.should.have.property('error');
        should(body.item).be.null;
    });


    it('verifying a merging draft create from discarded document should undiscard the document', async () => {
        user2 = await test.registerUser(user2Data);
        const affiliations = [iitInstitute.id];
        const user1Documents = (await test.getUserDocuments(user1)).items;
        const doc = user1Documents[0];

        const draft = await test.userCopyDocument(user2, doc);
        await test.userDiscardDocument(user2, doc);
        await test.userVerifyDraft(user2, draft, user2Doc1Position, affiliations);
        const body = await test.getUserDiscarded(user2);

        body.should.be.eql(test.EMPTY_RES);
    });

});