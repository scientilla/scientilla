/* global User */
'use strict';

const should = require('should');
const helper = require('./../helper.js');
const _ = require('lodash');

/*
 * Steps for "Keep draft and mark all as not duplicates" & "Verify"
 *
 * 1: Create a user
 * 2: Create a group
 * 3: Create a institute
 * 4: Create a document source
 * 5: Create a draft document with created user & created document source
 * 6: Verify created draft document
 * 7: Create a second draft document with created user & created document source
 * 8: Verify created draft document
 * 9: Create a third draft document with created user & created document source
 *
 * 10: Mark the two verified documents as not duplicates of the third document
 * 11: Verify the third (not verified) document
 */

describe('Document comparison', () => {
   before(helper.clean);

   const usersData = helper.getAllUserData(),
         documentsData = helper.getAllDocumentData(),
         institutesData = helper.getAllInstituteData(),
         sourcesData = helper.getAllSourceData(),
         groupsData = helper.getAllGroupData(),
         position1 = 4,
         position2 = 1;

   let user,
       source,
       group,
       document,
       draft,
       duplicate1,
       duplicate2,
       affiliations,
       institute;

   it ('A verified document should be created', async () => {
       // Create user
       user = await helper.registerUser(usersData[0]);

       // Create group
       group = await helper.createGroup(groupsData[0]);

       // Create institute
       institute = await helper.createInstitute(institutesData[0]);

       // Create source of document
       source = await helper.createSource(sourcesData[0]);

       // Set the source of each document
       documentsData.forEach(document => document.source = source);

       // Create draft
       draft = await helper.userCreateDraft(user, documentsData[0]);

       // Set affiliation
       affiliations = [institute.id];

       // Verify draft
       document = await helper.userVerifyDraft(user, draft, position1, affiliations);

       document.kind.should.be.equal('v');
   });

   it('Should fail to verify first duplicate', async () => {
       // Create draft with same data
       const data = documentsData[0];
       data.scopusId = '';

       draft = await helper.userCreateDraft(user, data);

       // Try to verify draft
       duplicate1 = await helper.userVerifyDraft(user, draft, position2, affiliations);

       duplicate1.error.should.be.equal('Documents must be compared');
   });

   it('Duplicate should be marked as not duplicate', async () => {
       // Mark as not duplicates
       await helper.userMarkAllAsNotDuplicates(user, draft.id, [document.id]);

        // Verify draft
       duplicate1 = await helper.userVerifyDraft(user, draft, position2, affiliations);

       duplicate1.kind.should.be.equal('v');
   });

   it('Should fail to verify second duplicate', async () => {
       // Create draft with same data
       const data = documentsData[0];
       data.scopusId = '';

       draft = await helper.userCreateDraft(user, data);

       // Try to verify draft
       duplicate2 = await helper.userVerifyDraft(user, draft, position2, affiliations);

       duplicate2.error.should.be.equal('Documents must be compared');
   });

   it('Should be possible to replace a verified document with a duplicate', async () => {
       const verificationData = {
           position: position1,
           affiliations
       };
       // Remove the verified document and verify the draft
       duplicate2 = await helper.userRemoveVerify(user, draft, verificationData, document);

       duplicate2.kind.should.be.equal('v');
   });
});