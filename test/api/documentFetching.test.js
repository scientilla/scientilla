'use strict';
const test = require('./../helper.js');

describe('Document fetching', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const userData = test.getAllUserData()[0];
    let user;

    it('it should be possible to ask for non-existent relations. They should be ignored.', () =>
        test.registerUser(userData)
            .then(res => user = res.body)
            .then(() =>test
                .getUserDocuments(user, 'non-existent-relation')
                .expect(200, {count: 0, items: []}))
    );

});