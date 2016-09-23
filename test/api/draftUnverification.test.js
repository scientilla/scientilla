/* global User */

var should = require('should');
var test = require('./../helper.js');

describe('Draft Unverification', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var user1Data = test.getAllUserData()[0];
    var user2Data = test.getAllUserData()[1];
    var documentData = test.getAllDocumentData()[0];
    var user1;
    var user2;
    var document;

    it('it should be possible to unverify a document', function () {

        return test
                .registerUser(user1Data)
                .then(function (res) {
                    user1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .createDraft(user1, documentData);
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
                    return test.verifyDocument(user2, document);
                })
                .then(function (res) {
                    return test
                            .unverifyDocument(user1, document)
                            .expect(200);
                })
                .then(function (res) {
                    return test
                            .getDocuments(user1)
                            .expect(200, []);
                })
                .then(function (res) {
                    return test
                            .getDrafts(user1)
                            .expect(200, []);
                })
                .then(function (res) {
                    return test
                            .getDocuments(user2, 'privateCoauthors')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var document = res.body[0];
                                document.privateCoauthors.should.have.length(1);
                                document.privateCoauthors[0].username.should.equal(user2.username);
                            });
                });
    });

    it('a document unverified by all the authors should be deleted', function () {
        return test
                .unverifyDocument(user2, document)
                .expect(200)
                .then(function (res) {
                    return test
                            .getDrafts(user2)
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    return test
                            .getDocuments(user2)
                            .expect(200, []);
                })
                .then(function (res) {
                    return test
                            .getDocument(document.id)
                            .expect(404);
                });
    });

});