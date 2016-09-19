/* global Reference */

var test = require('./../helper.js');

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