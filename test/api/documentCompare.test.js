/* global User */
'use strict';

const should = require('should');
const helper = require('./../helper.js');
const _ = require('lodash');

describe('Document comparison', () => {
   before(helper.clean);

   const usersData = helper.getAllUserData(),
         documentsData = helper.getAllDocumentData(),
         institutesData = helper.getAllInstituteData(),
         sourcesData = helper.getAllSourceData(),
         groupsData = helper.getAllGroupData();

   let user1,
       user2,
       user3,
       source,
       group,
       document,
       draft,
       duplicate1,
       duplicate2,
       suggested,
       affiliations,
       institute,
       suggestedDocuments,
       externalDocument;

   describe('Verified documents', () => {
       it ('A verified document should be created', async () => {
           // Create user
           user1 = await helper.registerUser(usersData[0]);

           // Create group
           group = await helper.createGroup(groupsData[0]);

           // Create institute
           institute = await helper.createInstitute(institutesData[0]);

           // Create source of document
           source = await helper.createSource(sourcesData[0]);

           // Set the source of each document
           documentsData.forEach(document => document.source = source);

           // Create draft
           draft = await helper.userCreateDraft(user1, documentsData[0]);

           // Set affiliation
           affiliations = [institute.id];

           // Verify draft
           document = await helper.userVerifyDraft(user1, draft, 4, affiliations);
           document.kind.should.be.equal('v');
       });

       it('Should fail to verify first duplicate', async () => {
           // Create draft with same data but remove the scopusId
           const data = documentsData[0];
           data.scopusId = '';
           draft = await helper.userCreateDraft(user1, data);

           // Verify draft with other position
           duplicate1 = await helper.userVerifyDraft(user1, draft, 1, affiliations);
           duplicate1.error.should.be.equal('Documents must be compared');
       });

       it('Marked duplicate as not duplicate & verify', async () => {
           // Mark as not duplicates
           await helper.userMarkAllAsNotDuplicates(user1, draft.id, [document.id]);

           // Verify draft
           duplicate1 = await helper.userVerifyDraft(user1, draft, 1, affiliations);
           duplicate1.kind.should.be.equal('v');
       });

       it('Should fail to verify second duplicate', async () => {
           // Create draft with same data but remove the scopusId
           const data = documentsData[0];
           data.scopusId = '';
           draft = await helper.userCreateDraft(user1, data);

           // Try to verify draft
           duplicate2 = await helper.userVerifyDraft(user1, draft, 1, affiliations);
           duplicate2.error.should.be.equal('Documents must be compared');
       });

       it('Should be possible to replace a duplicate with a verified document', async () => {
           const verificationData = {
               position: 4,
               affiliations
           };

           // Remove the verified document and verify the draft
           duplicate2 = await helper.userRemoveVerify(user1, draft, verificationData, document);
           duplicate2.kind.should.be.equal('v');
       });
   });

    describe('Suggested documents', () => {
        it('Create a suggested document', async () => {
            // Create new user2
            user2 = await helper.registerUser(usersData[1]);

            // Create draft with user1 in author string but change something so the document is different
            const data = documentsData[0];
            data.scopusId = '';
            data.year = '2019';
            draft = await helper.userCreateDraft(user2, data);

            // Verify draft
            suggested = await helper.userVerifyDraft(user2, draft, 1, affiliations);
            suggested.kind.should.be.equal('v');
        });

        it('A suggested document should be available', async () => {
            // Get suggested documents of user 1
            suggestedDocuments = await helper.getUserSuggestedDocuments(user1);
            suggestedDocuments.count.should.be.greaterThan(0);
        });

        it('Should fail to verify a suggested document that is a duplicate', async () => {
            // Verify the suggested document
            suggested = suggestedDocuments.items[0];
            const result = await helper.userVerifyDocument(user1, suggested, 2, affiliations);
            result.error.should.be.equal('Documents must be compared');
        });

        it('Mark duplicates as not duplicate & verify', async () => {
            // Get the suggested document with duplicates
            suggestedDocuments = await helper.getUserSuggestedDocument(user1, suggested, ['duplicates']);
            suggested = suggestedDocuments[0];

            // Get only the duplicate id's
            const duplicateIds = helper.getUniqueDuplicateIds(suggested);

            // Mark those id's as not duplicates
            await helper.userMarkAllAsNotDuplicates(user1, suggested.id, duplicateIds);

            // Verify the suggested document
            suggested = await helper.userVerifyDocument(user1, suggested, 2, affiliations);
            suggested.kind.should.be.equal('v');
        });

        it('Create another suggested document', async () => {
            // Create new user3
            user3 = await helper.registerUser(usersData[2]);

            // Create draft with user1 in author string but change something so the document is different
            const data = documentsData[0];
            data.scopusId = '';
            data.year = '2018';
            draft = await helper.userCreateDraft(user3, data);

            // Verify draft
            suggested = await helper.userVerifyDraft(user3, draft, 1, affiliations);
            suggested.kind.should.be.equal('v');
        });

        it('A suggested document should be available', async () => {
            // Get suggested documents of user 1
            suggestedDocuments = await helper.getUserSuggestedDocuments(user1);
            suggestedDocuments.count.should.be.greaterThan(0);
        });

        it('Should fail to verify a suggested document that is a duplicate', async () => {
            // Verify suggested document
            suggested = suggestedDocuments.items[0];
            const result = await helper.userVerifyDocument(user1, suggested, 2, affiliations);
            result.error.should.be.equal('Documents must be compared');
        });

        it('Should be possible to replace a duplicate with a suggested document', async () => {
            const verificationData = {
                position: 4,
                affiliations
            };

            // Get the suggested document with duplicates
            suggestedDocuments = await helper.getUserSuggestedDocument(user1, suggested, ['duplicates']);
            suggested = suggestedDocuments[0];

            // Get the only duplicate id's
            const duplicateIds = helper.getUniqueDuplicateIds(suggested);

            // Get duplicate document
            const duplicates = await helper.getUserDocument(user1, {id: duplicateIds[0]});
            const duplicate = duplicates[0];

            // Remove the verified document and verify the suggested document
            duplicate2 = await helper.userRemoveVerify(user1, suggested, verificationData, duplicate);
            duplicate2.kind.should.be.equal('v');
        });
    });

    describe('External documents', () => {
        it('Create external document', async () => {
            // Create external document
            externalDocument = await helper.createExternalDocument(documentsData[0]);
            externalDocument.kind.should.be.equal('e');
        });

        it('Should fail to verify external document with duplicates', async () => {
            // Verify external document
            const result = await helper.userVerifyDocument(user1, externalDocument, 3, affiliations);
            result.error.should.be.equal('Documents must be compared');
        });

        it('Mark duplicates as not duplicate & verify', async () => {
            // Keep only the duplicates of the user
            externalDocument.duplicates = externalDocument.duplicates.filter(duplicate => {
                if (duplicate.researchEntity === user1.id) {
                    return duplicate;
                }
            });

            // Get only the duplicate id's
            const duplicateIds = helper.getUniqueDuplicateIds(externalDocument);

            // Mark those id's as not duplicate
            await helper.userMarkAllAsNotDuplicates(user1, externalDocument.id, duplicateIds);

            // Verify external document
            document = await helper.userVerifyDocument(user1, externalDocument, 3, affiliations);
            document.kind.should.be.equal('v');
        });

        it('Create a second external document', async () => {
            // Create external document
            externalDocument = await helper.createExternalDocument(documentsData[0]);
            externalDocument.kind.should.be.equal('e');
        });

        it('Should fail to verify external document with duplicates', async () => {
            // Verify external document
            const result = await helper.userVerifyDocument(user1, externalDocument, 3, affiliations);
            result.error.should.be.equal('Documents must be compared');
        });

        it('Should be possible to replace a duplicate with a external document', async () => {
            const verificationData = {
                position: 4,
                affiliations
            };

            // Keep only the duplicates of the user
            externalDocument.duplicates = externalDocument.duplicates.filter(duplicate => {
                if (duplicate.researchEntity === user1.id) {
                    return duplicate;
                }
            });

            // Get only the duplicate id's
            const duplicateIds = helper.getUniqueDuplicateIds(externalDocument);

            // Get duplicate document
            const duplicates = await helper.getUserDocument(user1, {id: duplicateIds[0]});
            const duplicate = duplicates[0];

            // Remove the verified document and verify the external document
            document = await helper.userRemoveVerify(user1, externalDocument, verificationData, duplicate);
            document.kind.should.be.equal('v');
        });
    });

    describe('Draft documents', () => {
        it('Create a draft document', async () => {
            // Create draft
            draft = await helper.userCreateDraft(user1, documentsData[0]);
            draft.kind.should.be.equal('d');
        });

        it('Should fail to verify draft with duplicates', async () => {
            // Set affiliation
            affiliations = [institute.id];

            // Verify draft
            const result = await helper.userVerifyDraft(user1, draft, 4, affiliations);
            result.error.should.be.equal('Documents must be compared');
        });

        it('Mark duplicates as not duplicate & verify', async () => {
            // Get the draft with duplicates
            const drafts = await helper.getUserDraft(user1, draft, ['duplicates']);
            draft = drafts[0];

            // Get only the duplicate id's
            const duplicateIds = helper.getUniqueDuplicateIds(draft);

            // Mark as not duplicate
            await helper.userMarkAllAsNotDuplicates(user1, draft.id, duplicateIds);

            // Verify draft
            document = await helper.userVerifyDraft(user1, draft, 3, affiliations);
            document.kind.should.be.equal('v');
        });

        it('Create a second draft document', async () => {
            // Create draft
            draft = await helper.userCreateDraft(user1, documentsData[0]);
            draft.kind.should.be.equal('d');
        });

        it('Should be possible to replace the duplicate with the draft document & verify', async () => {
            // Get the draft with duplicates
            const drafts = await helper.getUserDraft(user1, draft, ['duplicates']);
            draft = drafts[0];

            // Get only the duplicate id's
            const duplicateIds = helper.getUniqueDuplicateIds(draft);

            // Get duplicate document
            const duplicates = await helper.getUserDocument(user1, {id: duplicateIds[0]});
            const duplicate = duplicates[0];

            const verificationData = {
                position: 1,
                affiliations
            };

            // Remove the verified document and verify the external document
            document = await helper.userRemoveVerify(user1, draft, verificationData, duplicate);
            document.kind.should.be.equal('v');
        });
    });
});