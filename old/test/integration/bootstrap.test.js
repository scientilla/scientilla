"use strict";

var test = require('./../helper.js');
var config = require('./../../config/scientilla.js');

describe('Bootstrap', function () {
    after(test.cleanDb);


    it('should create a default group', function () {
        const mainInstitute = sails.config.scientilla.institute;
        return Group
            .find()
            .then(groups => {
                groups.should.have.length(1);
                groups[0].name.should.equal(mainInstitute.name);
                groups[0].shortname.should.equal(mainInstitute.shortname);
                groups[0].scopusId.should.equal(mainInstitute.scopusId);
            })
    });
    it('should create a default institute', function () {
        const mainInstitute = sails.config.scientilla.institute;
        return Institute
            .find()
            .then(institutes => {
                institutes.should.have.length(1);
                institutes[0].name.should.equal(mainInstitute.name);
                institutes[0].shortname.should.equal(mainInstitute.shortname);
                institutes[0].scopusId.should.equal(mainInstitute.scopusId);
            })
    });

});