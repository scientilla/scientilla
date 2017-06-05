"use strict";

var test = require('./../helper.js');


describe('Documents merge', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    const documentsData = test.getAllDocumentData();
    const user1Data = test.getAllUserData()[0];
    const user2Data = test.getAllUserData()[1];
    const institutesData = test.getAllInstituteData();
    const sourcesData = test.getAllSourceData();
    let user1, user2, draft1, draft2, document1, document2, institute, externalDocument;

    it("should merge two documents if they are equal", async function () {
        const newTitle = 'test';
        user1 = await User.registerUser(user1Data);
        user2 = await User.registerUser(user2Data);
        institute = await Institute.create(institutesData[0]);
        const journal = await Source.create(sourcesData[0]);
        const doc1 = documentsData[0];
        doc1.source = journal.id;
        doc1.authorships = [{corresponding: true, affiliations: [institute.id], position: 1}];
        externalDocument = await test.createExternalDocument(doc1);
        draft1 = await User.createDraft(User, user1.id, externalDocument);
        document1 = await User.verifyDraft(User, user1.id, draft1.id, 0, [institute.id], true);
        await Document.update(externalDocument.id, {title: newTitle});
        externalDocument = await Document.findOneById(externalDocument.id);
        draft2 = await User.createDraft(User, user2.id, externalDocument);
        document2 = await User.verifyDraft(User, user2.id, draft2.id, 1, [institute.id], true);
        await Synchronizer.synchronizeScopus();
        document1 = await Document.findOneById(document1.id);

        document1.title.should.equal(newTitle);
        document2.title.should.equal(newTitle);
        document1.id.should.not.equal(document2.id);

        await DocumentMerger.mergeDocuments();
        const user1Documents = await test.getUserDocuments(user1);
        document1 = user1Documents.items[0];
        const user2Documents = await test.getUserDocuments(user2);
        document2 = user2Documents.items[0];

        document1.id.should.equal(document2.id);

        const allDocuments = await Document.find();
        allDocuments.length.should.equal(2);
    });

});