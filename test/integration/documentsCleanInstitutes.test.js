"use strict";

var test = require('./../helper.js');


describe('Documents clean institutes', function () {
    before(test.cleanDb);

    const documentsData = test.getAllDocumentData();
    const [user1Data, user2Data, user3Data] = test.getAllUserData();
    const institutesData = test.getAllInstituteData();
    const sourcesData = test.getAllSourceData();
    let user1, user2, user3, draft1, draft2, draft3, document1, document2, document3, externalDocument;
    let iit, unige, iit2, iit3;

    it("should remove institutes if scopusId is equal to a different one", async function () {
        const newTitle = 'test';
        user1 = await User.registerUser(user1Data);
        user2 = await User.registerUser(user2Data);
        user3 = await User.registerUser(user3Data);
        [iit, unige, iit2, iit3] = await Promise.all(institutesData.map(i => Institute.create(i)));
        await Institute.update({id: iit3.id}, {parentId: iit.id});

        const journal = await Source.create(sourcesData[0]);
        const doc1 = documentsData[0];
        doc1.source = journal.id;
        doc1.authorships = [{corresponding: true, affiliations: [iit.id], position: 1}];

        draft1 = await User.createDraft(User, user1.id, doc1);
        document1 = await User.verifyDraft(User, user1.id, draft1.id, {
            position: 0,
            affiliationInstituteIds: [iit.id],
            corresponding: true,
            synchronize: true
        });

        doc1.title = newTitle;
        draft2 = await User.createDraft(User, user2.id, doc1);
        document2 = await User.verifyDraft(User, user2.id, draft2.id, {
            position: 1,
            affiliationInstituteIds: [iit2.id],
            corresponding: true,
            synchronize: true
        });

        doc1.title = 'test2';
        draft3 = await User.createDraft(User, user3.id, doc1);
        document3 = await User.verifyDraft(User, user3.id, draft3.id, {
            position: 1,
            affiliationInstituteIds: [iit3.id],
            corresponding: true,
            synchronize: true
        });

        let allInstitutes = await Institute.find();
        allInstitutes.length.should.equal(institutesData.length);

        let user1Documents = await test.getUserDocuments(user1, ['affiliations']);
        let doc1instituteId = user1Documents.items[0].affiliations.find(a => a.institute).institute;
        let user2Documents = await test.getUserDocuments(user2, ['affiliations']);
        let doc2instituteId = user2Documents.items[0].affiliations.find(a => a.institute).institute;
        let user3Documents = await test.getUserDocuments(user2, ['affiliations']);
        let doc3instituteId = user3Documents.items[0].affiliations.find(a => a.institute).institute;

        doc1instituteId.should.not.equal(doc2instituteId);
        doc1instituteId.should.not.equal(doc3instituteId);

        await Cleaner.cleanInstituteCopies();

        const allDocuments = await Document.find();
        allDocuments.length.should.equal(3);

        allInstitutes = await Institute.find();
        allInstitutes.length.should.equal(institutesData.length-1);

        user1Documents = await test.getUserDocuments(user1, ['affiliations']);
        doc1instituteId = user1Documents.items[0].affiliations.find(a => a.institute).institute;
        user2Documents = await test.getUserDocuments(user2, ['affiliations']);
        doc2instituteId = user2Documents.items[0].affiliations.find(a => a.institute).institute;
        user3Documents = await test.getUserDocuments(user3, ['affiliations']);
        doc3instituteId = user3Documents.items[0].affiliations.find(a => a.institute).institute;

        doc1instituteId.should.equal(doc2instituteId);
        doc1instituteId.should.equal(doc3instituteId);
    });

});