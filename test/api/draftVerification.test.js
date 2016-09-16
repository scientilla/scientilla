/* global User */

var should = require('should');
var assert = require('assert');
var request = require('supertest-as-promised');
var test = require('./../helper.js');

describe('Draft Verification', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var url = test.getUrl();
    var userData = test.getUsers()[0];
    var documentData = test.getDocuments()[0];
    var incompleteDocumentData = test.getDocuments()[1];
    var user;
    var draft;

    it('there should be no verified documents for a new user', function () {
        return request(url)
                .get('/users')
                .expect(200, [])
                .then(function (res) {
                    return request(url)
                            .post('/auths/register')
                            .send(userData)
                            .expect(200);
                })
                .then(function (res) {
                    user = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user.id + '/privateReferences')
                            .expect(200, []);
                });
    });

    it('verifying a complete draft should be possible', function () {
        return request(url)
                .post('/users/' + user.id + '/drafts')
                .send(documentData)
                .expect(200)
                .then(function (res) {
                    draft = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .put('/users/' + user.id + '/drafts/' + draft.id + '/verified')
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user.id + '/drafts')
                            .expect(200, []);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user.id + '/privateReferences?populate=privateCoauthors')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var document = res.body[0];
                                document.title.should.equal(documentData.title);
                                document.draft.should.be.false;
                                should(document.draftCreator).be.null;
                                document.privateCoauthors.should.have.length(1);
                                document.privateCoauthors[0].username.should.equal(user.username);
                            });
                });
    });

    it('verifying a complete draft twice should give an error', function () {
        return request(url)
                .put('/users/' + user.id + '/drafts/' + draft.id + '/verified')
                .send(documentData)
                .expect(400);
    });

    it('verifying a non complete draft should not be possible', function () {
        return request(url)
                .post('/users/' + user.id + '/drafts')
                .send(incompleteDocumentData)
                .expect(200)
                .then(function (res) {
                    draft = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .put('/users/' + user.id + '/drafts/' + draft.id + '/verified')
                            .send(documentData)
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.draft.should.be.true;
                            });
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user.id + '/drafts')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                            });
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user.id + '/privateReferences')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                            });
                });
    });

    it('verifying a nonexsting document should give an error', function () {
        return request(url)
                .put('/users/' + user.id + '/drafts/' + 10000 + '/verified')
                .send(documentData)
                .expect(400);
    });

});