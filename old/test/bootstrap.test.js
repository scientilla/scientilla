const Sails = require('sails');
let sails;

before(function (done) {

    var testConfig = {
        environment: 'test',
        models: {
            connection: 'test',
            migrate: 'drop'
        },
        port: 1338,
        log: {
            level: 'warn'
        },
        hooks: {grunt: false}
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
    //TODO check which eventlistener is preventing the process to stop autonomously.
    setTimeout(process.exit, 2000);
});