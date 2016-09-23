var test = require('./../helper.js');

describe('Document fetching', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var userData = test.getAllUserData()[0];
    var user;

    it('it should be possible to ask for non-existent relations. They should be ignored.', function () {
        return test
                .registerUser(userData)
                .then(function (res) {
                    user = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .getDocuments(user, 'non-existent-relation')
                            .expect(200, []);
                });
    });
    
});