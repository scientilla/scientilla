/* global User */

var should = require('should');
var assert = require('assert');
var request = require('supertest-as-promised');
var test = require('./../helper.js');
var Reference = require('../../api/models/Reference');

describe('Document model', function () {
    
    describe('isValid', function () {
        
        it('should be able to validate a document that is complete', function () {
            var documentData = test.getDocuments()[0];
            var document = test.createModel(Reference, documentData);
            document.isValid().should.be.true;
        });
        
        it('should be able to reject a document that is not complete', function () {
            var documentData = test.getDocuments()[1];
            var document = test.createModel(Reference, documentData);
            document.isValid().should.be.false;
        });
        
    });
    
});