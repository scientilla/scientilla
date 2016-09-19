/* global User */

var should = require('should');
var request = require('supertest-as-promised');
var test = require('./../helper.js');

describe('Document Suggestions', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var url = test.getUrl();
    var user1Data = test.getAllUserData()[0];
    var user2Data = test.getAllUserData()[1];
    var user3Data = test.getAllUserData()[2];
    var documentData = test.getDocuments()[0];
    var user1;
    var user2;
    var user3;
    var document;

    it('it should suggest the reference to the user whose surname is among the authors (str)', function () {
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
                            .get('/users/' + user2.id + '/suggested-documents')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var d = res.body[0];
                                d.id.should.equal(document.id);
                            });
                });
    });

    it('after the user verifies the document, it should not be suggested anymore', function () {
        return request(url)
                .post('/users/' + user2.id + '/privateReferences')
                .send({id: document.id})
                .expect(200)
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user2.id + '/suggested-documents')
                            .expect(200, []);
                });
    });
    it('if the surname of the user is not included in the author string, the document is not suggested', function () {
        return request(url)
                .post('/auths/register')
                .send(user3Data)
                .expect(200)
                .then(function (res) {
                    user3 = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user3.id + '/suggested-documents')
                            .expect(200, []);
                });
    });
});