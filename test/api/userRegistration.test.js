/* global User */

var test = require('./../helper.js');

describe('User registration', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var userData = test.getAllUserData()[0];

    it('by default there should be no users', function () {
        return test
                .getUsers()
                .expect(200, []);
    });
    it('should be able to register new user when there is no users', function () {
        return test
                .registerUser(userData)
                .then(function (res) {
                    return test
                            .getUsers()
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
        return test
                .registerUser(userData)
                .expect(400);
    });

});