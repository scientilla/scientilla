/* global User */
'use strict';

const should = require('should');
const test = require('./../helper.js');

describe('Draft Unverification', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const user1Data = test.getAllUserData()[0];
    const user2Data = test.getAllUserData()[1];
    const documentData = test.getAllDocumentData()[0];
    const institutesData = test.getAllInstituteData();
    const groupsData = test.getAllGroupData();
    const iitInstituteData = institutesData[0];
    const sourcesData = test.getAllSourceData();
    const iitGroupData = groupsData[0];
    let user1;
    let user2;
    let document;
    let journal;
    let iitGroup;
    const user1Doc1Position = 4;
    const user2Doc1Position = 0;
    let iitInstitute;

    it('it should be possible to unverify a document', async () => {
        iitGroup = (await test.createGroup(iitGroupData)).body;
        iitInstitute = (await test.createInstitute(iitInstituteData)).body;
        journal = (await test.createSource(sourcesData[0])).body;
        user1 = (await test.registerUser(user1Data)).body;
        documentData.source = journal;
        document = (await test.userCreateDraft(user1, documentData)).body;
        const affiliations = [iitInstitute.id];
        await test.userVerifyDraft(user1, document, user1Doc1Position, affiliations);
        user2 = (await test.registerUser(user2Data)).body;
        const affiliations2 = [iitInstitute.id];
        await test.userVerifyDocument(user2, document, user2Doc1Position, affiliations2);
        await test.userUnverifyDocument(user1, document)
            .expect(200);
        await test.getUserDocuments(user1)
            .expect(200, test.EMPTY_RES);
        await test.getUserDrafts(user1)
            .expect(200, test.EMPTY_RES);
        await test.getUserDocumentsWithAuthors(user2)
            .expect(res => {
                res.status.should.equal(200);
                res.body.items.should.have.length(1);
                const document = res.body.items[0];
                document.authors.should.have.length(1);
                document.authors[0].username.should.equal(user2.username);
            });
    });

    it('a document unverified by all the authors should be deleted', async () => {
        await test.userUnverifyDocument(user2, document)
            .expect(200);
        await test.getUserDrafts(user2)
            .send(documentData)
            .expect(200);
        await test.getUserDocuments(user2)
            .expect(200, test.EMPTY_RES);
        await test.getDocument(document.id)
            .expect(404);
    });

});