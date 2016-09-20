/* global User */

var should = require('should');
var test = require('./../helper.js');

describe('Document Suggestions', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var user1Data = test.getAllUserData()[0];
    var user2Data = test.getAllUserData()[1];
    var user3Data = test.getAllUserData()[2];
    var documentData = test.getAllDocumentData()[0];
    var user1;
    var user2;
    var user3;
    var document;

    it('it should suggest the reference to the user whose surname is among the authors (str)', function () {
        return test.registerUser(user1Data)
                .then(function (res) {
                    user1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test.createDraft(user1, documentData);
                })
                .then(function (res) {
                    document = res.body;
                    return res;
                })
                .then(function (res) {
                    return test.verifyDraft(user1, document);
                })
                .then(function (res) {
                    return test.registerUser(user2Data);
                })
                .then(function (res) {
                    user2 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .getSuggestedDocuments(user2)
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var d = res.body[0];
                                d.id.should.equal(document.id);
                            });
                });
    });

    it('after the user verifies the document, it should not be suggested anymore', function () {
        return test
                .verifyDocument(user2, document)
                .expect(200)
                .then(function (res) {
                    return test
                            .getSuggestedDocuments(user2)
                            .expect(200, []);
                });
    });
    it('if the surname of the user is not included in the author string, the document is not suggested', function () {
        return test.registerUser(user3Data)
                .then(function (res) {
                    user3 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .getSuggestedDocuments(user3)
                            .expect(200, []);
                });
    });
});