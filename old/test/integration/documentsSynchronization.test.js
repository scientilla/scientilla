"use strict";

const test = require('./../helper.js');


describe('Synchronization', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    const documentsData = test.getAllDocumentData();
    const userData = test.getAllUserData();
    const institutesData = test.getAllInstituteData();
    const sourcesData = test.getAllSourceData();
    let user, user2, draft, institute, externalDocument;

    it("should update a draft that was copied from external", async function () {
        const newTitle = 'test';
        user = await User.registerUser(userData[0]);
        institute = await Institute.create(institutesData[0]);
        const journal = await Source.create(sourcesData[0]);
        const doc1 =  (await test.fixDocumentsDocumenttype(documentsData))[0];
        doc1.source = journal.id;
        doc1.origin = 'scopus';
        doc1.synchronized = true;
        doc1.authorships = [{corresponding: true, affiliations: [institute.id], position: 0}];
        externalDocument = await test.createExternalDocument(doc1);
        draft = await User.createDraft(User, user.id, externalDocument);
        await Document.update(externalDocument.id, {title: newTitle});
        await Synchronizer.synchronizeScopus();
        const updatedDraft = await Document.findOneById(draft.id);
        updatedDraft.title.should.equal(newTitle);
    });

    it("should update a verified document", async function () {
        user2 = await User.registerUser(userData[1]);
        const newTitle = 'test 3';

        const document = await User.verifyDraft(User, user.id, draft.id, {
            position: 0,
            affiliationInstituteIds: [institute.id],
            corresponding: true,
            synchronize: true
        });
        await Document.update(externalDocument.id, {title: newTitle});
        await Synchronizer.synchronizeScopus();
        const updatedDocument = await Document.findOneById(document.id);
        updatedDocument.title.should.not.equal(documentsData[0].title);
    });


    it("should split a document with an authorship with synchronize = false ", async function () {
        const newYear = '2018';
        const oldYear = externalDocument.year;
        await User.verifyDocument(User, user2.id, draft.id, {
            position: 1,
            affiliationInstituteIds: [institute.id],
            corresponding: true,
            synchronize: false
        });

        await Document.update(externalDocument.id, {year: newYear});
        await Synchronizer.synchronizeScopus();

        const clonedDocument = await Document.findOne({year: oldYear, kind: 'v'}).populate(['authorships']);
        const updatedDocument = await Document.findOne({year: newYear, kind: 'v'}).populate(['authorships']);

        should.not.be.empty(clonedDocument);
        should.not.be.empty(updatedDocument);

        const clonedDocumentAuthorshipsVerified = clonedDocument.authorships.filter(a => a.researchEntity);
        const updatedDocumentAuthorshipsVerified = updatedDocument.authorships.filter(a => a.researchEntity);

        should.not.be.empty(clonedDocumentAuthorshipsVerified);
        should.not.be.empty(updatedDocumentAuthorshipsVerified);

        clonedDocumentAuthorshipsVerified.should.have.length(1);
        updatedDocumentAuthorshipsVerified.should.have.length(1);

        clonedDocumentAuthorshipsVerified[0].synchronize.should.equal(false);
        updatedDocumentAuthorshipsVerified[0].synchronize.should.equal(true);
    });

});