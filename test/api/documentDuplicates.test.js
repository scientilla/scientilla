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
    const user1Doc1Position = 4;
    let iitInstitute;

    it('there should be duplicates for some documents', async () => {
            user = await test.registerUser(userData);
            iitGroup = await test.createGroup(iitGroupData);
            iitInstitute = await test.createInstitute(iitInstituteData);
            journal = await test.createSource(sourcesData[0]);

            documentsData.forEach(d => d.source = journal);

            userDrafts = await test.userCreateDrafts(user, documentsData);
            userDuplicateDrafts = await test.userCreateDrafts(user, documentsData);
            const affiliations = [iitInstitute.id];

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

});