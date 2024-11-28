/* global Document, sails, User, ObjectComparer, Connector, Source, Authorship, Affiliation, Institute, DocumentKinds, ExternalImporter, DocumentOrigins, Synchronizer, DocumentTypes, SourceTypes, Exporter, DocumentNotDuplicate, DocumentNotDuplicateGroup, SqlService, Exporter */
'use strict';

/**
 * Document.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

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
    {name: 'handle'},
    {name: 'isPhdThesisInstitutional'},
    {name: 'curriculum'},
    {name: 'supervisors'},
    {name: 'otherSupervisors'},
    {name: 'language'},
    {name: 'academicInstitution'},
    {name: 'phdInstitute'},
    {name: 'phdCourse'},
    {name: 'phdCycle'},
    {name: 'synchronized'},
    {name: 'synchronized_at'}
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
        synchronized_at: "DATETIME",
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
        scopusDocumentMetadata: {
            collection: 'scopusdocumentmetadata',
            via: 'document'
        },
        openaireMetadata: {
            collection: 'openairedocumentmetadata',
            via: 'document'
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
            through: 'discardeddocument'
        },
        discardedGroups: {
            collection: 'Group',
            via: 'discardedDocuments',
            through: 'discardedgroup'
        },
        discarded: {
            collection: 'discardeddocument',
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
        //PhD thesis only fields
        isPhdThesisInstitutional: {
            columnName: 'is_phd_thesis_institutional',
            type: 'BOOLEAN'
        },
        curriculum: 'STRING',
        supervisors: 'STRING',
        otherSupervisors: {
            columnName: 'other_supervisors',
            type: 'STRING'
        },
        language: 'STRING',
        handle: 'STRING',
        academicInstitution: {
            columnName: 'academic_institution',
            type: 'STRING'
        },
        phdInstitute: {
            columnName: 'phd_institute',
            model: 'PhdInstitute'
        },
        phdCourse: {
            columnName: 'phd_course',
            model: 'PhdCourse'
        },
        phdCycle: {
            columnName: 'phd_cycle',
            model: 'PhdCycle'
        },
        isDraft: function () {
            return this.kind === DocumentKinds.DRAFT
        },
        isValid() {
            const requiredFields = [
                'authorsStr',
                'title',
                'year',
                'type',
                'sourceType'
            ];

            switch (this.type) {
                case DocumentTypes.PHD_THESIS:
                    if (this.isPhdThesisInstitutional) {
                        requiredFields.push('phdInstitute');
                        requiredFields.push('phdCourse');
                        requiredFields.push('phdCycle');
                        requiredFields.push('supervisors');
                    }
                    break;
                case DocumentTypes.INVITED_TALK:
                    requiredFields.push('itSource');
                    break;
                default:
                    requiredFields.push('source');
                    break;
            }

            return _.every(requiredFields, v => this[v]) && this.hasValidAuthorsStr() && this.hasValidYear();
        },
        hasValidAuthorsStr() {
            const authorsStrRegex = /^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)*$/;
            return authorsStrRegex.test(this.authorsStr);
        },
        hasValidYear() {
            const yearRegex = /^(19|20)\d{2}$/;
            return yearRegex.test(this.year);
        },
        async hasMainInstituteAffiliated() {
            const mainInstituteId = 1;
            const authorships = await Authorship.find({document: this.id}).populate('affiliations');
            const affiliated = authorships.find(a => a.affiliations.map(aff => aff.id).includes(mainInstituteId));
            return !!affiliated;
        },
        draftToDocument: function () {
            this.kind = DocumentKinds.VERIFIED;
            this.draftCreator = null;
            this.draftGroupCreator = null;
            return this.savePromise();
        },
        getAuthors: function () {
            if (!this.authorsStr) return [];
            return this.authorsStr.replace(/\s+et all\s*/i, '').split(',').map(_.trim);
        },
        getUcAuthors: function () {
            const authors = this.getAuthors();
            return _.map(authors, function (a) {
                return a.toUpperCase();
            });
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
                this.synchronized_at = null;
                return this.savePromise();
            }

            return await Synchronizer.documentSynchronizeScopus(this.id);
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

            if (this.source.type === SourceTypes.BOOK && this.source.publisher) {
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
                const first_coauthor = authorship ? authorship.first_coauthor : null;
                const last_coauthor = authorship ? authorship.last_coauthor : null;
                const oral_presentation = authorship ? authorship.oral_presentation : null;
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
                    first_coauthor,
                    last_coauthor,
                    oral_presentation,
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
        getMetric(metric) {
            if (!this.sourceMetrics)
                return undefined;

            const metricAllYears = this.sourceMetrics.filter(m => m.name === metric);
            const year = Math.max(...metricAllYears.map(m => parseInt(m.year, 10)));
            const m = metricAllYears.find(m => m.year === year);
            return m && parseFloat(m.value) ? parseFloat(m.value) : undefined;
        },
        getCitations(origin) {
            if (origin !== DocumentOrigins.SCOPUS || !this.scopusDocumentMetadata || !this.scopusDocumentMetadata[0] || !this.scopusDocumentMetadata[0].data.citations)
                return undefined;

            return this.scopusDocumentMetadata[0].data.citations;
        },
        getOpenaireOpenAccessLinks() {
            if (!this.openaireMetadata || !this.openaireMetadata[0] || !Array.isArray(this.openaireMetadata[0].data.links))
                return [];

            return this.openaireMetadata[0].data.links
                .filter(l => l.accessRight === 'OPEN')
                .map(l => {
                    const newLink = _.cloneDeep(l);
                    newLink.url = newLink.urls.length > 0 ? newLink.urls[0] : undefined;
                    delete newLink.urls;
                    return newLink;
                });
        },
        toJSON: function () {
            const document = this.toObject();
            document.sourceDetails = this.getSourceDetails();
            document.duplicates = this.duplicates;
            document.inPress = this.getInPress();
            document.authorDetails = this.getAuthorDetails();
            document.sourceTypeObj = this.getSourceType();
            document.documenttype = this.getdocumentType();

            document.SJR = this.getMetric('SJR');
            document.SNIP = this.getMetric('SNIP');
            document.IF = this.getMetric('IF');
            document.scopusCitations = this.getCitations(DocumentOrigins.SCOPUS);
            document.openAccessLinks = this.getOpenaireOpenAccessLinks();

            document.bibtex = Document.getBibtex(document);

            return document;
        }
    },
    getBibtex(doc) {
        if (!_.isObject(doc.documenttype) || !_.isObject(doc.source))
            return;

        return Exporter.getBibtex(doc);
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
            document.discarded.length +
            document.discardedG.length;
    },
    deleteIfNotVerified: async function (documentId) {
        const document = await Document.findOneById(documentId)
            .populate('authors')
            .populate('groups')
            .populate('authorships')
            .populate('affiliations')
            .populate('discarded')
            .populate('discardedG');
        if (!document)
            return {
                error: 'Document ' + documentId + ' does not exist',
                item: documentId
            };
        if (Document.getNumberOfConnections(document) === 0) {
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
    async getDOIs() {
        const res = await SqlService.query('SELECT distinct doi FROM document WHERE doi is not null and doi <> \'\'');
        return res.map(d => d.doi);
    },
    async getScopusIds() {
        const res = await SqlService.query('SELECT distinct "scopusId" FROM document WHERE "scopusId" is not null and "scopusId" <> \'\'');
        return res.map(d => d.scopusId);
    },
    findCopies: async function (document, AuthorshipPositionNotToCheck = null) {
        function areAuthorshipsAffiliationsMergeable(as1, as2) {
            return as1.every(a1 => {
                const a2 = as2.find(a2 => a1.position === a2.position);
                return a1.position === AuthorshipPositionNotToCheck ||
                    (!a1.isVerified() && a2.isVerified()) ||
                    (!a2.isVerified() && a1.isVerified()) ||
                    !a1.isVerified() && !a2.isVerified() && (
                        (!a1.hasAffiliations() && a2.hasAffiliations()) ||
                        (!a2.hasAffiliations() && a1.hasAffiliations()) ||
                        Authorship.isMetadataEqual(a1, a2)
                    );
            });
        }

        const query = _.pick(document, Document.getFields());
        query.id = {'!': document.id};
        delete query.synchronized_at;
        if (_.isObject(document.source) && document.source.id)
            query.source = document.source.id;
        query.kind = DocumentKinds.VERIFIED;
        const similarDocuments = await Document.find(query)
            .populate('authorships')
            .populate('affiliations')
            .populate('groups');
        const draftFullAuthorships = document.getFullAuthorships();
        const tmpCopies = similarDocuments.filter(d => {
            const copyFullAuthorships = d.getFullAuthorships();
            return draftFullAuthorships.length === copyFullAuthorships.length &&
                areAuthorshipsAffiliationsMergeable(draftFullAuthorships, copyFullAuthorships);
        });
        return tmpCopies.filter(d => {
            const copyFullAuthorships = d.getFullAuthorships();
            const noDoubleAuthors = draftFullAuthorships.every(a1 => {
                const a2 = copyFullAuthorships.find(a2 => a1.position === a2.position);
                return !a1.researchEntity || !a2.researchEntity || a1.researchEntity !== a2.researchEntity;
            });
            const noDoubleGroups = _.intersection(document.groups.map(g => g.id), d.groups.map(g => g.id)).length === 0;
            return noDoubleAuthors && noDoubleGroups;
        });
    },
    createOrUpdate: async function (criteria, documentData) {
        const selectedData = Document.selectData(documentData);
        selectedData.source = await Document.getFixedCollection(Source, selectedData.source);
        selectedData.documenttype = await Document.getFixedCollection(DocumentType, selectedData.documenttype);
        if (!selectedData.documenttype)
            await Document.fixDocumentType(selectedData);
        Document.fixPhdPopulates(selectedData);

        const oldDoc = await Document.findOne(criteria);
        let doc;
        if (oldDoc) {
            await Document.update(criteria, selectedData);
            doc = await Document.findOne(criteria);
        } else doc = await Document.create(selectedData);
        if (!doc)
            throw 'Document not created';

        await Authorship.updateAuthorships(doc, documentData.authorships);

        return doc;
    },
    desynchronizeAll: async function (drafts) {
        const desynchronizedDrafts = [];
        for (let d of drafts) {
            const draft = await Document.findOneById(d);
            if (!draft)
                continue;

            draft.synchronized = false;
            draft.synchronized_at = null;
            await draft.savePromise();
            desynchronizedDrafts.push(draft);
        }
        return desynchronizedDrafts;
    },
    setAuthorships: async function (docId, authorshipsData) {
        if (!docId) throw "setAuthorship error!";

        const document = await Document.findOne({id: docId});
        if (!document) throw 'Document not found';
        const authData = await Authorship.getMatchingAuthorshipsData(document, authorshipsData);
        await Authorship.updateAuthorships(document, authData);
    },
    clone: async function (document, newDocPartialData = {}) {
        const docData = Document.selectData(document);
        await Document.fixDocumentType(docData);
        const newDocData = Object.assign({}, docData, newDocPartialData);
        return await Document.create(newDocData);
    },
    externalSearch: async function (origin, searchKey, searchValue) {
        const document = await ExternalImporter.search(origin, searchKey, searchValue);
        if (!document)
            return {};

        return document;
    },
    mergeAuthorships: async (docFrom, docTo) => {
        const authorshipsFrom = docFrom.getFullAuthorships();
        const authorshipsTo = docTo.getFullAuthorships();

        const authorshipsData = authorshipsFrom.map(aFrom => {
            const aTo = authorshipsTo.find(a => a.position === aFrom.position);
            let newAuthorship = aTo.isVerified() || aTo.hasAffiliations() ? aTo : aFrom;
            newAuthorship.affiliations = newAuthorship.affiliations.map(af => af.institute);
            return newAuthorship;
        });

        await Authorship.updateAuthorships(docTo, authorshipsData);
    },
    async customPopulate(elems, fieldName, parentModelName, parentModelId) {
        if (fieldName === 'duplicates') {
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
        const documentType = DocumentTypes.getDocumentType(document.type);
        if (documentType)
            document.documenttype = documentType.id;
    },
    fixPhdPopulates(document) {
        if (_.has(document, 'phdInstitute.id')) {
            document.phdInstitute = document.phdInstitute.id;
        }

        if (_.has(document, 'phdCourse.id')) {
            document.phdCourse = document.phdCourse.id;
        }

        if (_.has(document, 'phdCycle.id')) {
            document.phdCycle = document.phdCycle.id;
        }
    },
    async export(documentIds, format) {
        let documents = await Document.find({id: documentIds})
            .populate([
                'source',
                'sourceMetrics',
                'scopusDocumentMetadata',
                'documenttype',
            ]);

        documents = _.orderBy(documents, ['year', 'title'], ['desc', 'asc']);

        if (format === 'csv') {
            const rows = mapDocuments(documents);
            return Exporter.generateCSV(rows);
        } else if (format === 'excel') {
            const rows = mapDocuments(documents);
            return await Exporter.generateExcel([rows], ['Documents']);
        } else if (format === 'bibtex')
            return Exporter.documentsToBibtex(documents);
    },
    beforeCreate: async (document, cb) => {
        if (Array.isArray(document)) {
            sails.log.error(`Document.beforeCreate called with an array with length ${document.length}`);
        }
        if (document && document.type && !document.documenttype)
            sails.log.error(`Document.beforeCreate, document without documenttype ${document.id}`);
        // fixDocumentType(document);
        cb();
    },
    async moveDocumentNotDuplicates(docFromId, docToId) {
        const dnds = await DocumentNotDuplicate.find({or: [{document: docFromId}, {duplicate: docFromId}]});
        const dndgs = await DocumentNotDuplicateGroup.find({or: [{document: docFromId}, {duplicate: docFromId}]});

        function convertDND(dnd) {
            const d1 = dnd.document === docFromId ? docToId : dnd.document;
            const d2 = dnd.duplicate === docFromId ? docToId : dnd.duplicate;
            if (d1 === d2) return;
            return {
                document: Math.min(d1, d2),
                duplicate: Math.max(d1, d2),
                researchEntity: dnd.researchEntity
            }
        }

        const newDnds = dnds.map(convertDND).filter(dnd => dnd);
        const newDndgs = dndgs.map(convertDND).filter(dnd => dnd);

        await DocumentNotDuplicate.create(newDnds);
        await DocumentNotDuplicateGroup.create(newDndgs);
    },
    async mergeDraft(document, draft) {
        await Document.mergeAuthorships(draft, document);
        await Document.moveDocumentNotDuplicates(draft.id, document.id);

        sails.log.debug('Draft ' + draft.id + ' will be deleted and substituted by ' + document.id);
        await Document.destroy({id: draft.id});

        return document;
    }
});


function mapDocuments(documents) {
    return [[
        'Authors',
        'Title',
        'Source',
        'Year',
        'DOI',
        'Type',
        'Source type',
        'Citations',
        'IF',
        'SNIP',
        'SJR',
        'Reference'
    ]].concat(documents.map(d => {
        const document = d.toJSON();
        const doc = [];
        doc.push(document.authorsStr);
        doc.push(document.title);

        let source;
        if (document.type === DocumentTypes.INVITED_TALK)
            source = document.itSource;
        else
            source = document.source ? document.source.title : '';

        doc.push(source);
        doc.push(document.year);
        doc.push(document.doi);
        doc.push(document.documenttype ? document.documenttype.label : '');
        doc.push(document.sourceTypeObj ? document.sourceTypeObj.label : '');
        doc.push(Array.isArray(document.scopusCitations) ? document.scopusCitations.reduce((total, s) => total + s.value, 0) : '');
        doc.push(document.IF);
        doc.push(document.SNIP);
        doc.push(document.SJR);

        const reference = [
            document.authorsStr,
            document.title,
            document.sourceDetails,
            document.year,
            document.doi
        ];
        doc.push(reference.filter(r => !_.isNil(r)).join(', '));

        return doc;
    }));
}