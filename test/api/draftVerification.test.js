/* global User */

var should = require('should');
var request = require('supertest-as-promised');
var test = require('./../helper.js');

describe('Draft Verification', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var url = test.getUrl();
    var user1Data = test.getUsers()[0];
    var user2Data = test.getUsers()[1];
    var documentData = test.getDocuments()[0];
    var incompleteDocumentData = test.getDocuments()[1];
    var user1;
    var user2;
    var user1Draft1;
    var user1Draft2;
    var user2Draft1;

    it('there should be no verified documents for a new user', function () {
        return request(url)
                .get('/users')
                .expect(200, [])
                .then(function (res) {
                    return request(url)
                            .post('/auths/register')
                            .send(user1Data)
                            .expect(200);
                })
                .then(function (res) {
                    user1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user1.id + '/privateReferences')
                            .expect(200, []);
                });
    });

    it('verifying a complete draft should be possible', function () {
        return request(url)
                .post('/users/' + user1.id + '/drafts')
                .send(documentData)
                .expect(200)
                .then(function (res) {
                    user1Draft1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .put('/users/' + user1.id + '/drafts/' + user1Draft1.id + '/verified')
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user1.id + '/drafts')
                            .expect(200, []);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user1.id + '/privateReferences?populate=privateCoauthors')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var document = res.body[0];
                                document.title.should.equal(documentData.title);
                                document.draft.should.be.false;
                                should(document.draftCreator).be.null;
                                document.privateCoauthors.should.have.length(1);
                                document.privateCoauthors[0].username.should.equal(user1.username);
                            });
                });
    });

    it('verifying a complete draft twice should give an error', function () {
        return request(url)
                .put('/users/' + user1.id + '/drafts/' + user1Draft1.id + '/verified')
                .send(documentData)
                .expect(400);
    });

    it('verifying a non complete draft should not be possible', function () {
        return request(url)
                .post('/users/' + user1.id + '/drafts')
                .send(incompleteDocumentData)
                .expect(200)
                .then(function (res) {
                    user1Draft2 = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .put('/users/' + user1.id + '/drafts/' + user1Draft2.id + '/verified')
                            .send(documentData)
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.draft.should.be.true;
                            });
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user1.id + '/drafts')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                            });
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user1.id + '/privateReferences')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                            });
                });
    });

    it('verifying a nonexsting document should give an error', function () {
        return request(url)
                .put('/users/' + user1.id + '/drafts/' + 10000 + '/verified')
                .send(documentData)
                .expect(400);
    });

    it('verifying two identical documents should merge them', function () {
        return request(url)
                .post('/auths/register')
                .send(user2Data)
                .expect(200)
                .then(function (res) {
                    user2 = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .post('/users/' + user2.id + '/drafts')
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    user2Draft1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .put('/users/' + user2.id + '/drafts/' + user2Draft1.id + '/verified')
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user2.id + '/privateReferences?populate=privateCoauthors')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var document = res.body[0];
                                document.id.should.equal(user1Draft1.id);
                                document.title.should.equal(documentData.title);
                                document.draft.should.be.false;
                                should(document.draftCreator).be.null;
                                document.privateCoauthors.should.have.length(2);
                                document.privateCoauthors[0].username.should.equal(user1.username);
                                document.privateCoauthors[1].username.should.equal(user2.username);
                            });
                });
    });

});