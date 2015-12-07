var Sails = require('sails'),
        sails;

var test = require('./helper.js');

before(function (done) {

    var testConfig = {
        models: {
            connection: 'test',
            migrate: 'drop'
        },
        port: 1338,
        log: {
            level: 'warn'
        }
    };
    Sails.lift(testConfig, function (err, server) {
        sails = server;
        if (err)
            return done(err);
        // here you can load fixtures, etc.
        done(err, sails);
    });
});

after(function (done) {
    // here you can clear fixtures, etc.
    sails.lower(done);
});