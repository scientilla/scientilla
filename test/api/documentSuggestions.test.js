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

    it('it should suggest the document to the user whose surname is among the authors (str)', () =>
        test.createGroup(iitGroupData)
            .then(res => iitGroup = res.body)
            .then(() => test.createInstitute(iitInstituteData))
            .then(res => iitInstitute = res.body)
            .then(() => test.createSource(sourcesData[0]))
            .then(res => journal = res.body)
            .then(() => test.registerUser(user1Data))
            .then(res => user1 = res.body)
            .then(() => {
                documentData.source = journal;
                return test.userCreateDraft(user1, documentData)
            })
            .then(res => document = res.body)
            .then(() => {
                const affiliations = [iitInstitute.id];
                return test.userVerifyDraft(user1, document, user1Doc1Position, affiliations);
            })
            .then(() => test.registerUser(user2Data))
            .then(res => user2 = res.body)
            .then(() =>test
                .getUserSuggestedDocuments(user2)
                .expect(function (res) {
                    res.status.should.equal(200);
                    res.body.items.should.have.length(1);
                    const d = res.body.items[0];
                    d.id.should.equal(document.id);
                }))
    );

    it('after the user verifies the document, it should not be suggested anymore', () => {
            const affiliations = [iitInstitute.id];
            return test.userVerifyDocument(user2, document, user2Doc1Position, affiliations)
                .expect(200)
                .then(function (res) {
                    return test
                        .getUserSuggestedDocuments(user2)
                        .expect(200, test.EMPTY_RES);
                })
        });

    it('if the surname of the user is not included in the author string, the document is not suggested', () =>
        test.registerUser(user3Data)
            .then(res => user3 = res.body)
            .then(()=> test.getUserSuggestedDocuments(user3)
                .expect(200, test.EMPTY_RES))
    );
});