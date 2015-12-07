module.exports = {
    cleanDb: function (done) {
        async.map(
                [User],
                function (model, cb) {
                    model.destroy(cb);
                },
                function (err, res) {
                    return done(err);
                    done();
                });
    },
    finalCheck: function (done) {
        return function (err) {
            if (err)
                return done(err);
            done();
        };
    }
};