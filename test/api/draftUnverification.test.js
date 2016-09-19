/* global User */

var should = require('should');
var request = require('supertest-as-promised');
var test = require('./../helper.js');

describe('Draft Unverification', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var url = test.getUrl();
    var user1Data = test.getAllUserData()[0];
    var user2Data = test.getAllUserData()[1];
    var documentData = test.getDocuments()[0];
    var user1;
    var user2;
    var document;

    it('it should be possible to unverify a document', function () {

        return request(url)
                .post('/auths/register')
                .send(user1Data)
                .expect(200)
                .then(function (res) {
                    user1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .post('/users/' + user1.id + '/drafts')
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    document = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .put('/users/' + user1.id + '/drafts/' + document.id + '/verified')
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    return request(url)
                            .post('/auths/register')
                            .send(user2Data)
                            .expect(200);
                })
                .then(function (res) {
                    user2 = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .post('/users/' + user2.id + '/privateReferences')
                            .send({id: document.id})
                            .expect(200);
                })
                .then(function (res) {
                    return request(url)
                            .put('/users/' + user1.id + '/references/' + document.id + '/unverified')
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user1.id + '/privateReferences?populate=privateCoauthors')
                            .expect(200, []);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user1.id + '/drafts')
                            .expect(200, []);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user2.id + '/privateReferences?populate=privateCoauthors')
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
        return request(url)
                .put('/users/' + user2.id + '/references/' + document.id + '/unverified')
                .expect(200)
                .then(function (res) {
                    return request(url)
                            .post('/users/' + user2.id + '/drafts')
                            .send(documentData)
                            .expect(200);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user2.id + '/privateReferences?populate=privateCoauthors')
                            .expect(200, []);
                })
                .then(function (res) {
                    return request(url)
                            .get('/references/' + document.id)
                            .expect(404);
                });
    });

});