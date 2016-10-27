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
    let user1;
    let user2;
    let user3;
    let document;

    it('it should suggest the reference to the user whose surname is among the authors (str)', () =>
        test.registerUser(user1Data)
            .then(res => user1 = res.body)
            .then(() => test.userCreateDraft(user1, documentData))
            .then(res => document = res.body)
            .then(() => test.userVerifyDraft(user1, document))
            .then(() => test.registerUser(user2Data))
            .then(res => user2 = res.body)
            .then(() =>test
                .getUserSuggestedDocuments(user2)
                .expect(function (res) {
                    res.status.should.equal(200);
                    res.body.should.have.length(1);
                    const d = res.body[0];
                    d.id.should.equal(document.id);
                }))
    );

    it('after the user verifies the document, it should not be suggested anymore', () =>
        test.userVerifyDocument(user2, document)
            .expect(200)
            .then(function (res) {
                return test
                    .getUserSuggestedDocuments(user2)
                    .expect(200, []);
            })
    );

    it('if the surname of the user is not included in the author string, the document is not suggested', () =>
        test.registerUser(user3Data)
            .then(res => user3 = res.body)
            .then(()=> test.getUserSuggestedDocuments(user3)
                .expect(200, []))
    )
});