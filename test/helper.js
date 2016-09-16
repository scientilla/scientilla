/* global User, Promise, Auth, Reference */

module.exports = {
    cleanDb: function (done) {
        var models = [Auth, User, Reference];
        var destroyFns =
                models.map(function (model) {
                    return model.destroy();
                });
        Promise.all(destroyFns)
                .then(_ => done())
                .catch(done);
    },
    finalCheck: function (done) {
        return function (err) {
            if (err)
                return done(err);
            done();
        };
    },
    getUrl: function () {
        //sTODO: get real host.
        return 'http://localhost:1338';
    },
    getUsers: function () {
        return users;
    }
};

var users = [{
        username: 'federico.bozzini@gmail.com',
        password: 'userpass',
        name: 'Federico',
        lastName: 'Bozzini'
    }];