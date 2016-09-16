/* global User */

var should = require('should');
var assert = require('assert');
var request = require('supertest-as-promised');
var test = require('./../helper.js');

describe('User registration', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var url = test.getUrl();
    var userData = test.getUsers()[0];

    it('should be able to register new user when there is no users', function () {
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
                    return request(url)
                            .get('/users')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var newUser = res.body[0];
                                newUser.username.should.equal(userData.username);
                                newUser.role.should.equal(User.ADMINISTRATOR);
                            });
                });
    });

    it('should not be able to register a user with an already used username', function () {
        return request(url)
                .post('/auths/register')
                .send(userData)
                .expect(400);
    });

});