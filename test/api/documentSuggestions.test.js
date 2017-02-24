/* global User */
'use strict';

const should = require('should');
const test = require('./../helper.js');

describe('Document Suggestions', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const user1Data = test.getAllUserData()[0];
    const user2Data = test.getAllUserData()[1];
    const user3Data = test.getAllUserData()[2];
    const documentData = test.getAllDocumentData()[0];
    const sourcesData = test.getAllSourceData();
    const groupsData = test.getAllGroupData();
    const institutesData = test.getAllInstituteData();
    const iitInstituteData = institutesData[0];
    const iitGroupData = groupsData[0];
    let user1;
    let user2;
    let user3;
    let document;
    let journal;
    let iitGroup;
    const user1Doc1Position = 4;
    const user2Doc1Position = 0;
    let iitInstitute;

    it('it should suggest the document to the user whose surname is among the authors (str)', async() => {
        iitGroup = (await test.createGroup(iitGroupData)).body;
        iitInstitute = (await test.createInstitute(iitInstituteData)).body;
        journal = (await test.createSource(sourcesData[0])).body;
        user1 = (await test.registerUser(user1Data)).body;
        documentData.source = journal;
        document = (await test.userCreateDraft(user1, documentData)).body;
        const affiliations = [iitInstitute.id];
        await test.userVerifyDraft(user1, document, user1Doc1Position, affiliations);
        user2 = (await test.registerUser(user2Data)).body;
        await test
            .getUserSuggestedDocuments(user2)
            .expect(function (res) {
                res.status.should.equal(200);
                res.body.items.should.have.length(1);
                const d = res.body.items[0];
                d.id.should.equal(document.id);
            });
    });

    it('after the user verifies the document, it should not be suggested anymore', async() => {
        const affiliations = [iitInstitute.id];
        await test
            .userVerifyDocument(user2, document, user2Doc1Position, affiliations)
            .expect(200);
        await test
            .getUserSuggestedDocuments(user2)
            .expect(200, test.EMPTY_RES);
    });

    it('if the surname of the user is not included in the author string, the document is not suggested', async () => {
        user3 = (await test.registerUser(user3Data)).body;
        await test
            .getUserSuggestedDocuments(user3)
            .expect(200, test.EMPTY_RES);
    });
});