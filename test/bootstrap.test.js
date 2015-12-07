var Sails = require('sails'),
        sails;

var test = require('./helper.js');

before(function (done) {

    var testConfig = {
        // configuration for testing purposes
        adapters: {
            default: 'test'
        },
        migrate: 'drop',
        port: 1338
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