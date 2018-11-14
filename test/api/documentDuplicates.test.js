/* global User */
'use strict';

const should = require('should');
const _ = require('lodash');
const test = require('./../helper.js');

describe('Document duplicates', () => {
    before(test.clean);

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData().slice(2, 4);
    let duplicateDocumentsData;
    const institutesData = test.getAllInstituteData();
    const sourcesData = test.getAllSourceData();
    const groupsData = test.getAllGroupData();
    const userData = usersData[0];
    const iitInstituteData = institutesData[0];
    const iitGroupData = groupsData[0];
    let user;
    let journal;
    let iitGroup;
    let userDrafts;
    let userDuplicateDrafts;
    let affiliations;
    const user1Doc1Position = 4;
    const user1Doc2Position = 1;
    let iitInstitute;

    it('there should be duplicates for some documents', async () => {
            user = await test.registerUser(userData);
            iitGroup = await test.createGroup(iitGroupData);
            iitInstitute = await test.createInstitute(iitInstituteData);
            journal = await test.createSource(sourcesData[0]);

            documentsData.forEach(d => d.source = journal);

            userDrafts = await test.userCreateDrafts(user, documentsData);
            userDuplicateDrafts = await test.userCreateDrafts(user, documentsData);
            affiliations = [iitInstitute.id];

            const res = await test.userVerifyDraft(user, userDrafts[0], user1Doc1Position, affiliations);

            const allUserDrafts = await test.getUserDrafts(user, ['duplicates']);

            const allUserDocs = await test.getUserDocuments(user, ['duplicates']);

            allUserDrafts.items.forEach(d => {
                d.duplicates.should.be.ok;
                d.duplicates.length.should.be.above(0);
                d.duplicates[0].duplicate.should.not.equal(d.id);
            });

            const doc1 = allUserDocs.items[0];
            doc1.duplicates.should.be.ok;
            doc1.duplicates.length.should.equal(1);
        }
    );

    it('should be possible to substitute a verified document with a duplicate', async () => {
        const allUserDrafts = (await test.getUserDrafts(user, ['duplicates'])).items;
        const allUserDocs = (await test.getUserDocuments(user, ['duplicates'])).items;

        const draft1 = allUserDrafts[0];
        const doc1 = allUserDocs[0];
        const verificationData = {
            position: user1Doc1Position,
            affiliations
        };
        await test.userRemoveVerify(user, draft1, verificationData, doc1);
        const allNewUserDrafts = (await test.getUserDrafts(user, ['duplicates'])).items;
        const allNewUserDocs = (await test.getUserDocuments(user, ['duplicates'])).items;
        allUserDrafts.length.should.equal(allNewUserDrafts.length + 1);
        allNewUserDocs.length.should.equal(1);
    });

    it('should be possible to substitute a verified document with a duplicate', async () => {
        const allUserDrafts = (await test.getUserDrafts(user, ['duplicates'])).items;
        const draft1 = allUserDrafts[0];
        const draft2 = allUserDrafts[1];
        const verificationData = {
            position: user1Doc2Position,
            affiliations
        };

        await test.userRemoveVerify(user, draft1, verificationData, draft2);

        const allNewUserDocs = (await test.getUserDocuments(user, ['duplicates'])).items;
        const allNewUserDrafts = (await test.getUserDrafts(user, ['duplicates'])).items;
        allNewUserDocs.length.should.equal(2);
        allNewUserDrafts.length.should.equal(0);

    });

});