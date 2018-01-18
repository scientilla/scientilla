/* global Document, sails, User, ObjectComparer, Connector, Source, Authorship, Affiliation, Institute, DocumentKinds, ExternalImporter, DocumentOrigins, Synchronizer, DocumentTypes, SourceTypes */
'use strict';

/**
 * Document.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

const fields = [
    {name: 'authorsStr'},
    {name: 'authorKeywords'},
    {name: 'title'},
    {name: 'year'},
    {name: 'source'},
    {name: 'itSource'},
    {name: 'issue'},
    {name: 'volume'},
    {name: 'pages'},
    {name: 'articleNumber'},
    {name: 'doi'},
    {name: 'abstract'},
    {name: 'type'},
    {name: 'sourceType'},
    {name: 'scopusId'},
    {name: 'wosId'},
    {name: 'iitPublicationsId'},
    {name: 'origin'},
    {name: 'kind'},
    {name: 'synchronized'}
];

module.exports = _.merge({}, BaseModel, {
    /* CONSTANTS */
    DEFAULT_SORTING: {
        year: 'desc',
        title: 'asc',
        id: 'desc'
    },
    /* ATTRIBUTES */
    attributes: {
        title: 'STRING',
        authorsStr: 'STRING',
        authorKeywords: 'STRING',
        year: 'STRING',
        issue: 'STRING',
        volume: 'STRING',
        pages: 'STRING',
        articleNumber: 'STRING',
        doi: 'STRING',
        type: 'STRING',
        documenttype: {
            model: 'DocumentType'
        },
        sourceType: 'STRING',
        itSource: 'STRING',
        scopusId: 'STRING',
        wosId: 'STRING',
        iitPublicationsId: 'STRING',
        abstract: 'TEXT',
        kind: 'STRING',
        origin: 'STRING',
        synchronized: "BOOLEAN",
        source: {
            model: 'source'
        },
        authors: {
            collection: 'user',
            via: 'documents',
            through: 'authorship'
        },
        publicAuthors: {
            collection: 'user',
            via: 'document',
            through: 'publicauthorship'
        },
        suggestions: {
            collection: 'user',
            via: 'documents',
            through: 'documentsuggestion'
        },
        citations: {
            collection: 'citation',
            via: 'documents',
            through: 'scopuscitation'
        },
        externalUsers: {
            collection: 'user',
            via: 'document',
            through: 'externaldocument'
        },
        externalGroups: {
            collection: 'group',
            via: 'document',
            through: 'externaldocumentgroup'
        },
        groupSuggestions: {
            collection: 'group',
            via: 'documents',
            through: 'documentsuggestiongroup'
        },
        groups: {
            collection: 'group',
            via: 'documents',
            through: 'authorshipgroup'
        },
        publicGroups: {
            collection: 'group',
            via: 'document',
            through: 'publicauthorshipgroup'
        },
        authorships: {
            collection: 'authorship',
            via: 'document'
        },
        groupAuthorships: {
            collection: 'authorshipgroup',
            via: 'document'
        },
        affiliations: {
            collection: 'affiliation',
            via: 'document',
        },
        institutes: {
            collection: 'institute',
            via: 'document',
            through: 'affiliation'
        },
        duplicates: {
            collection: 'documentduplicate',
            via: 'document',
            custom: true
        },
        sourceMetrics: {
            collection: 'sourcemetric',
            via: 'document',
            through: 'documentmetric'
        },
        userTags: {
            collection: 'tag',
            via: 'document'
        },
        tagLabels: {
            collection: 'tagLabel',
            via: 'documents',
            through: 'tag'
        },
        groupTags: {
            collection: 'taggroup',
            via: 'document'
        },
        groupTagLabels: {
            collection: 'tagLabel',
            via: 'documents',
            through: 'taggroup'
        },
        discardedCoauthors: {
            collection: 'User',
            via: 'discardedDocuments',
            through: 'discarded'
        },
        discardedGroups: {
            collection: 'Group',
            via: 'discardedDocuments',
            through: 'discardedgroup'
        },
        discarded: {
            collection: 'discarded',
            via: 'document'
        },
        discardedG: {
            collection: 'discardedgroup',
            via: 'document'
        },
        draftCreator: {
            model: 'User'
        },
        draftGroupCreator: {
            model: 'Group'
        },
        isValid: function () {
            const authorsStrRegex = /^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*((\s|-)?[a-zA-ZÀ-ÖØ-öø-ÿ]\.)+)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*((\s|-)?\w\.)+)*$/;
            const yearRegex = /^(19|20)\d{2}$/;
            const self = this;
            const requiredFields = [
                'authorsStr',
                'title',
                'year',
                'type',
                'sourceType'
            ];
            if (this.type === DocumentTypes.INVITED_TALK)
                requiredFields.push('itSource');
            else
                requiredFields.push('source');

            return _.every(requiredFields, function (v) {
                    return self[v];
                }) && authorsStrRegex.test(self.authorsStr)
                && yearRegex.test(self.year);
        },
        draftToDocument: function () {
            this.kind = DocumentKinds.VERIFIED;
            this.draftCreator = null;
            this.draftGroupCreator = null;
            return this.savePromise();
        },
        getAuthors: function () {
            if (!this.authorsStr)
                return [];
            var authors = this.authorsStr.replace(/\s+et all\s*/i, '').split(',').map(_.trim);
            return authors;
        },
        getUcAuthors: function () {
            var authors = this.getAuthors();
            var ucAuthors = _.map(authors, function (a) {
                return a.toUpperCase();
            });
            return ucAuthors;
        },
        getAuthorIndex: async function (author) {
            const authors = this.getAuthors().map(a => a.toLocaleLowerCase());
            const aliases = (await author.getAliases()).map(a => a.toLocaleLowerCase());
            return _.findIndex(authors, a => _.includes(aliases, a));
        },
        isPositionVerified: function (position) {
            if (!this.authorships)
                return false;

            const authorship = this.getAuthorshipByPosition(position);

            return !!authorship && !_.isNil(authorship.researchEntity);
        },
        getAuthorshipByPosition: function (position) {
            if (_.isNil(this.authorships))
                throw 'getAuthorshipByPosition: authorships missing';

            return this.authorships.find(a => a.position === position);
        },
        getFullAuthorships: function () {
            if (!Array.isArray(this.affiliations) || _.isEmpty(this.authorships))
                return [];

            return this.authorships.map(authorship => {
                const auth = _.clone(authorship);
                auth.affiliations = this.affiliations.filter(affiliation => authorship.id === affiliation.authorship);
                return auth;
            });
        },
        scopusSynchronize: async function (synchronized) {
            if (!synchronized) {
                this.synchronized = false;
                return this.savePromise();
            }

            const res = await Synchronizer.documentSynchronizeScopus(this.id);
            return res.docData;
        },
        getSourceDetails: function () {
            if (!_.isObject(this.source))
                return null;
            const referenceFragments = [];
            if (this.source.title) {
                referenceFragments.push(this.source.title);
            }
            if (this.volume) {
                referenceFragments.push('vol. ' + this.volume);
            }
            if (this.issue) {
                referenceFragments.push('(no. ' + this.issue + ')');
            }
            if (this.pages) {
                referenceFragments.push('pp. ' + this.pages);
            }

            if (this.source.type == SourceTypes.BOOK && this.source.publisher) {
                referenceFragments.push('Publisher: ' + this.source.publisher);
            }

            return referenceFragments.join(', ');
        },
        getInPress: function () {
            return this.type === 'article_in_press';
        },
        getAuthorDetails: function () {
            if (!this.authorships.length)
                return undefined;
            if (!this.affiliations)
                this.affiliations = [];
            if (!this.institutes)
                this.institutes = [];
            return this.getAuthors().map((author, i) => {
                const authorship = this.authorships.find(au => au.position === i);
                const corresponding = authorship ? authorship.corresponding : null;
                let affiliations, mainGroupAffiliation, userId;
                if (authorship) {
                    const instituteIds = this.affiliations.filter(af => af.authorship === authorship.id)
                        .map(af => af.institute);
                    const institutes = this.institutes.filter(i => instituteIds.includes(i.id));
                    affiliations = institutes.map(i => i.name);
                    mainGroupAffiliation = instituteIds.includes(1);
                    userId = authorship.researchEntity;
                } else {
                    affiliations = null;
                    mainGroupAffiliation = null;
                    userId = null;
                }
                return {
                    author,
                    corresponding,
                    affiliations,
                    mainGroupAffiliation,
                    userId
                };
            });
        },
        getSourceType: function () {
            if (!this.sourceType)
                return undefined;

            return SourceTypes.get().find(st => st.key === this.sourceType);
        },
        getdocumentType: function () {
            if (!this.documenttype)
                return undefined;

            if (_.isObject(this.documenttype))
                return this.documenttype;

            return DocumentTypes.getDocumentType(this.documenttype);
        },
        toJSON: function () {
            const document = this.toObject();
            document.sourceDetails = this.getSourceDetails();
            document.duplicates = this.duplicates;
            document.inPress = this.getInPress();
            document.authorDetails = this.getAuthorDetails();
            document.sourceTypeObj = this.getSourceType();
            document.documenttype = this.getdocumentType();
            return document;
        }
    },
    getFields: function () {
        return fields.map(f => f.name);
    },
    selectData: function (draftData) {
        const documentFields = Document.getFields();
        return _.pick(draftData, documentFields);
    },
    getNumberOfConnections: function (document) {
        return document.authors.length +
            document.groups.length +
            document.discardedCoauthors.length +
            document.discardedGroups.length;
    },
    deleteIfNotVerified: async function (documentId) {
        const document = await Document.findOneById(documentId)
            .populate('authors')
            .populate('groups')
            .populate('authorships')
            .populate('affiliations')
            .populate('discardedCoauthors')
            .populate('discardedGroups');
        if (!document)
            return {
                error: 'Document ' + documentId + ' does not exist',
                item: documentId
            };
        if (Document.getNumberOfConnections(document) == 0) {
            sails.log.debug('Document ' + documentId + ' will be deleted');
            let deletedDocument = await Document.destroy({id: documentId});
            deletedDocument = deletedDocument[0];
            return deletedDocument;
        }
        return document;
    },
    filterSuggested: function (maybeSuggestedDocuments, toBeDiscardedDocuments, similarityThreshold) {
        var suggestedDocuments = [];
        _.forEach(maybeSuggestedDocuments, function (r1) {
            var checkAgainst = _.union(toBeDiscardedDocuments, suggestedDocuments);
            var discard = _.some(checkAgainst, function (r2) {
                return r1.getSimilarity(r2) > similarityThreshold;
            });
            if (discard)
                return;
            suggestedDocuments.push(r1);
        });
        return suggestedDocuments;
    },
    findCopies: async function (document, AuthorshipPositionNotToCheck = null, excludeMultipleVerification = true) {
        function areAuthorshipsEqual(as1, as2) {
            return as1.every(a1 => {
                const a2 = as2.find(a2 => a1.position === a2.position);
                return (
                    !a2 ||
                    a1.position === AuthorshipPositionNotToCheck ||
                    !_.isNil(a1.researchEntity) ||
                    !_.isNil(a2.researchEntity) ||
                    _.isEmpty(_.xor(_.map(a1.affiliations, 'institute'), _.map(a2.affiliations, 'institute')))
                );
            });
        }

        const query = _.pick(document, Document.getFields());
        query.id = {'!': document.id};
        query.kind = DocumentKinds.VERIFIED;
        const similarDocuments = await Document.find(query)
            .populate('authorships')
            .populate('affiliations')
            .populate('groups');
        const draftFullAuthorships = document.getFullAuthorships();
        const tmpCopies = similarDocuments.filter(d => {
            const copyFullAuthorships = d.getFullAuthorships();
            return areAuthorshipsEqual(draftFullAuthorships, copyFullAuthorships) &&
                areAuthorshipsEqual(copyFullAuthorships, draftFullAuthorships);
        });
        const copies = excludeMultipleVerification ? tmpCopies : tmpCopies.filter(d => {
            const copyFullAuthorships = d.getFullAuthorships();
            const noDoubleAuthors = draftFullAuthorships.every(a1 => {
                const a2 = copyFullAuthorships.find(a2 => a1.position === a2.position);
                return !a1.researchEntity || !a2.researchEntity || a1.researchEntity != a2.researchEntity;
            });
            const noDoubleGroups = _.intersection(document.groups.map(g => g.id), d.groups.map(g => g.id)).length == 0;
            return noDoubleAuthors && noDoubleGroups;
        });

        return copies;
    },
    createOrUpdate: async function (criteria, documentData) {
        const selectedData = Document.selectData(documentData);
        selectedData.source = await Document.getFixedCollection(Source, selectedData.source);
        selectedData.documenttype = await Document.getFixedCollection(DocumentType, selectedData.documenttype);
        if (!selectedData.documenttype)
            await Document.fixDocumentType(selectedData);

        const authorships = _.cloneDeep(documentData.authorships);

        if (_.isArray(authorships))
            for (const a of authorships)
                a.affiliations = (await Document.getFixedCollection(Institute, a.affiliations));

        let doc = await Document.findOne(criteria);
        if (doc) {
            await Document.update(criteria, selectedData);
            doc = await Document.findOne(criteria);
            await Authorship.updateAuthorships(doc, authorships);
        }
        else {
            doc = await Document.create(selectedData);
            if (!doc)
                throw 'Document not created';
            await Authorship.createEmptyAuthorships(doc, authorships);
        }

        return doc;
    },
    desynchronizeAll: async function (drafts) {
        const desynchronizedDrafts = [];
        for (let d of drafts) {
            const draft = await Document.findOneById(d);
            if (!draft)
                continue;

            draft.synchronized = false;
            await draft.savePromise();
            desynchronizedDrafts.push(draft);
        }
        return desynchronizedDrafts;
    },
    setAuthorships: async function (docId, authorshipsData) {
        if (!docId) throw "setAuthorship error!";
        const authData = authorshipsData.map(a => {
            const newAuth = Authorship.clone(a);
            newAuth.document = docId;
            return newAuth;
        });
        await Authorship.destroy({document: docId});
        await Affiliation.destroy({document: docId});
        await Authorship.create(authData);

        return await Document.findOneById(docId)
            .populate(['authorships', 'groupAuthorships', 'affiliations']);
    },
    clone: async function (document, newDocPartialData = {}) {
        const docData = Document.selectData(document);
        const newDocData = Object.assign({}, docData, newDocPartialData);
        return await Document.create(newDocData);
    },
    externalSearch: async function (origin, searchKey, searchValue) {
        const document = await ExternalImporter.search(origin, searchKey, searchValue);
        if (!document)
            return {};

        return document;
    },
    addMissingAffiliation: async (d1, d2) => {
        const as1 = d1.getFullAuthorships();
        const as2 = d2.getFullAuthorships();
        const toBeDeleteAuthorships = as1.filter(a1 =>
            _.isEmpty(a1.affiliations) &&
            _.isNil(a1.researchEntity) &&
            as2.some(a2 => a2.position == a1.position && !_.isEmpty(a2.affiliations))
        );
        const toBeAddedAuthorships = as2.filter(a2 => {
            const a1 = as1.find(a1 => a2.position === a1.position);
            return !a1 || toBeDeleteAuthorships.includes(a1);
        });
        const missingAuthorshipIds = toBeAddedAuthorships.map(a => a.id);
        const missingAffiliationIds = _.flatMap(toBeAddedAuthorships, a => a.affiliations.map(a => a.id));
        await Authorship.update({id: missingAuthorshipIds}, {document: d1.id});
        await Affiliation.update({id: missingAffiliationIds}, {document: d1.id});
        await Authorship.destroy({id: toBeDeleteAuthorships.map(a => a.id)})
    },
    async customPopulate(elems, fieldName, parentModelName, parentModelId) {
        if (fieldName == 'duplicates') {
            const duplicates = await DocumentDuplicate.find({
                researchEntityType: parentModelName,
                researchEntity: parentModelId,
                document: elems.map(e => e.id)
            });
            elems.forEach(e => e.duplicates = duplicates.filter(d => d.document === e.id));
        }
    },
    async fixDocumentType(document) {
        if (!document.type)
            return;
        const documentType = DocumentTypes.getDocumentType(this.documenttype);
        if (documentType)
            document.documenttype = documentType.id;
    }
});
