(function () {
    'use strict';

    const userConstants = {
        role: {
            USER: 'user',
            SUPERUSER: 'superuser',
            ADMINISTRATOR: 'administrator',
            GUEST: 'guest',
            EVALUATOR: 'evaluator',
        }
    };

    // TODO change to configuration webservice
    const config = {
        mainInstitute: {
            id: 1,
            shortname: 'IIT'
        }
    };

    const DocumentLabels = {
        DUPLICATE: 'duplicate',
        ALREADY_VERIFIED: 'already verified',
        ALREADY_IN_DRAFTS: 'already in drafts',
        DISCARDED: 'discarded',
        UNVERIFYING: 'unverifying',
        NEW: 'new',
        EXTERNAL: 'external'
    };

    const defaultSources = ['journal', 'conference', 'book', 'bookseries'];
    const invitedTalkSources = [
        'institute',
        'scientific_conference',
        'workshop',
        'school',
        'media',
        'public_event',
        'outreach'
    ];
    const documentTypes = [
        {
            key: 'article',
            shortLabel: 'AR',
            label: 'Article',
            defaultSource: 'journal',
            allowedSources: defaultSources
        },
        {
            key: 'article_in_press',
            shortLabel: 'AP',
            label: 'Article in Press',
            defaultSource: 'journal',
            allowedSources: defaultSources
        },
        {
            key: 'abstract_report',
            shortLabel: 'AB',
            label: 'Abstract Report',
            defaultSource: null,
            allowedSources: defaultSources
        },
        {
            key: 'book',
            shortLabel: 'BO',
            label: 'Book',
            defaultSource: 'book',
            allowedSources: defaultSources
        },
        {
            key: 'book_chapter',
            shortLabel: 'BC',
            label: 'Book Chapter',
            defaultSource: 'book',
            allowedSources: defaultSources
        },
        {
            key: 'conference_paper',
            shortLabel: 'CP',
            label: 'Conference Paper',
            defaultSource: 'conference',
            allowedSources: defaultSources
        },
        {
            key: 'conference_review',
            shortLabel: 'CR',
            label: 'Conference Review',
            defaultSource: 'conference',
            allowedSources: defaultSources
        },
        {
            key: 'data_paper',
            shortLabel: 'DP',
            label: 'Data Paper',
            defaultSource: 'journal',
            allowedSources: defaultSources
        },
        {
            key: 'editorial',
            shortLabel: 'ED',
            label: 'Editorial',
            defaultSource: null,
            allowedSources: defaultSources
        },
        {
            key: 'erratum',
            shortLabel: 'ER',
            label: 'Erratum',
            defaultSource: null,
            allowedSources: defaultSources
        },
        {
            key: 'letter',
            shortLabel: 'LE',
            label: 'Letter',
            defaultSource: null,
            allowedSources: defaultSources
        },
        {
            key: 'note',
            shortLabel: 'NO',
            label: 'Note',
            defaultSource: null,
            allowedSources: defaultSources
        },
        {
            key: 'report',
            shortLabel: 'RP',
            label: 'Report',
            defaultSource: null,
            allowedSources: defaultSources
        },
        {
            key: 'review',
            shortLabel: 'RV',
            label: 'Review',
            defaultSource: 'journal',
            allowedSources: defaultSources
        },
        {
            key: 'short_survey',
            shortLabel: 'SS',
            label: 'Short Survey',
            defaultSource: null,
            allowedSources: defaultSources
        },
        {
            key: 'invited_talk',
            shortLabel: 'IT',
            label: 'Invited Talk',
            defaultSource: null,
            allowedSources: invitedTalkSources
        },
        {
            key: 'phd_thesis',
            shortLabel: 'PT',
            label: 'PhD Thesis',
            defaultSource: 'book',
            allowedSources: defaultSources
        },
        {
            key: 'poster',
            shortLabel: 'PO',
            label: 'Poster',
            defaultSource: 'conference',
            allowedSources: defaultSources
        }
    ];

    const documentSourceTypes = [
        {id: 'book', label: 'Book', type: 'scientific'},
        {id: 'journal', label: 'Journal', type: 'scientific'},
        {id: 'conference', label: 'Conference', type: 'scientific'},
        {id: 'bookseries', label: 'Book Series', type: 'scientific'},
        {id: 'scientific_conference', label: 'Conference', section: 'Scientific Event', type: 'invited-talk'},
        {id: 'institute', label: 'Institute', section: 'Scientific Event', type: 'invited-talk'},
        {id: 'workshop', label: 'Workshop/Symposium', section: 'Scientific Event', type: 'invited-talk'},
        {id: 'school', label: 'School (Summer school, ...)', section: 'Scientific Event', type: 'invited-talk'},
        {id: 'media', label: 'Media', section: 'Dissemination', type: 'invited-talk'},
        {id: 'public_event', label: 'Public Event', section: 'Dissemination', type: 'invited-talk'},
        {id: 'outreach', label: 'Outreach', section: 'Dissemination', type: 'invited-talk'}
    ];

    const documentSearchForm = {
        title: {
            inputType: 'text',
            label: 'Title',
            matchColumn: 'title',
            matchRule: 'contains',
            type: 'field'
        },
        author: {
            inputType: 'text',
            label: 'Author',
            matchColumn: 'authorsStr',
            matchRule: 'contains',
            type: 'field'
        },
        minYear: {
            inputType: 'year',
            label: 'Year from',
            matchColumn: 'year',
            matchRule: '>=',
            type: 'field'
        },
        maxYear: {
            inputType: 'year',
            label: 'Year to',
            matchColumn: 'year',
            matchRule: '<=',
            type: 'field'
        },
        documentType: {
            inputType: 'select',
            label: 'Document Type',
            values: _.concat(
                [{value: "?", label: 'Select'}],
                documentTypes.map(s => ({value: s.key, label: s.label}))
            ),
            matchColumn: 'type',
            type: 'field'
        },
        sourceType: {
            inputType: 'select',
            label: 'Source Type',
            values: _.concat(
                [{value: "?", label: 'Select'}],
                documentSourceTypes.filter(t => t.type === 'scientific').map(s => ({value: s.id, label: s.label}))
            ),
            matchColumn: 'sourceType',
            type: 'field'
        }
    };

    const documentFieldsRules = {
        authorsStr: {
            allowNull: false,
            regex: /^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)*$/,
            message: 'Author string is not valid. It should be in the form \"Molinari E., Bozzini F., Semprini F.\".'
        },
        scopusId: {
            allowNull: true,
            regex: /^\d*$/,
            message: 'The ScopusID is not valid'
        },
        doi: {
            allowNull: true,
            regex: /^(10[.])/,
            message: 'The DOI is not valid. It should be like: 10.1038/nnano.2013.238'
        },
        year: {
            allowNull: false,
            regex: /^(19|20)\d{2}$/,
            message: 'This year is not valid. It should be like: 2018'
        },
        handle: {
            allowNull: true,
            regex: /^(http|https):\/\//,
            message: 'This handle should start with http:// or https://'
        },
        supervisors: {
            allowNull: true,
            regex: /^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)*$/,
            message: 'IIT supervisors string is not valid. It should be in the form \"Molinari E., Bozzini F., Semprini F.\".'
        },
        otherSupervisors: {
            allowNull: true,
            regex: /^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)*$/,
            message: 'Supervisors string is not valid. It should be in the form \"Molinari E., Bozzini F., Semprini F.\".'
        }
    };

    const documentOrigins = {
        SCIENTILLA: 'scientilla',
        SCOPUS: 'scopus',
        ORCID: 'orcid',
        PUBLICATIONS: 'publications'
    };

    const groupTypes = {
        INSTITUTE: 'Institute',
        CENTER: 'Center',
        RESEARCH_LINE: 'Research Line',
        RESEARCH_DOMAIN: 'Research Domain',
        FACILITY: 'Facility',
        DIRECTORATE: 'Directorate',
        PROJECT: 'Project',
        INITIATIVE: 'Initiative',
        OTHER: 'Other'
    };

    const groupTypeLabels = {
        INSTITUTE: 'Institute',
        CENTER: 'Center',
        RESEARCH_LINE: 'Research line',
        RESEARCH_DOMAIN: 'Research domain',
        FACILITY: 'Facility',
        DIRECTORATE: 'Directorate',
        PROJECT: 'Project',
        INITIATIVE: 'Initiative',
        OTHER: 'Other'
    };

    const groupTypePluralLabels = {
        INSTITUTE: 'Institutes',
        CENTER: 'Centers',
        RESEARCH_LINE: 'Research lines',
        RESEARCH_DOMAIN: 'Research domains',
        FACILITY: 'Facilities',
        DIRECTORATE: 'Directorates',
        PROJECT: 'Projects',
        INITIATIVE: 'Initiatives',
        OTHER: 'Others'
    };

    const apiPrefix = '/api/v1';

    const documentListSections = {
        VERIFIED: 'verified-documents',
        DRAFT: 'draft-list',
        EXTERNAL: 'external-documents',
        SUGGESTED: 'suggested-documents',
        GROUP: 'group-verified-documents',
        USER: 'user-verified-documents'
    };

    const documentCategories = {
        DRAFT: 'Draft',
        VERIFIED: 'Verified',
        EXTERNAL: 'External',
        SUGGESTED: 'Suggested'
    };

    const documentActions = {
        COMPARE: {
            KEEP_DOCUMENT: 'Keep document',
            USE_DUPLICATE: 'Use duplicate',
            DELETE_DRAFT: 'Delete draft',
            DISCARD_SUGGESTED_DOCUMENT: 'Discard suggested document',
            UNVERIFY_VERIFIED_DOCUMENT: 'Unverify verified document',
            MARK_ALL_AS_NOT_DUPLICATE: 'Mark all as not duplicate'
        },
        DRAFT: {
            VERIFY: 'Verify',
            KEEP_DRAFT: 'Keep as draft'
        },
        VERIFIED: {
            REPLACE: 'Replace',
            KEEP: 'Keep verified document',
            MOVE_TO_DRAFT: 'Move to drafts'
        },
        SUGGESTED: {
            VERIFY: 'Verify',
            COPY_TO_DRAFT: 'Copy to drafts'
        },
        EXTERNAL: {
            VERIFY: 'Verify',
            COPY_TO_DRAFT: 'Copy to drafts'
        },
        KEEP: {
            KEEP_VERIFIED_DOCUMENT: 'Keep verified document'
        },
        REPLACE: {
            UNVERIFY_DOCUMENT_AND_VERIFY_DRAFT: 'Unverify similar document and verify draft',
            UNVERIFY_DOCUMENT_AND_KEEP_DRAFT: 'Unverify similar document and keep as draft',
            UNVERIFY_DOCUMENT_AND_COPY_SUGGESTED_TO_DRAFT: 'Unverify similar document and copy suggested document to draft',
            UNVERIFY_DOCUMENT_AND_REPLACE: 'Unverify similar document and replace by source document',
            COPY_EXTERNAL_DOCUMENT_AND_VERIFY: 'Copy external document and verify source document',
            UNVERIFY_DOCUMENT_AND_VERIFY: 'Unverify similar document and verify source document',
            UNVERIFY_DOCUMENT_AND_COPY_EXTERNAL_TO_DRAFT: 'Unverify similar document and copy external document to draft',
            UNVERIFY_DOCUMENT_AND_MOVE_TO_DRAFT: 'Unverify similar document and move document to draft'
        },
        CANCEL: 'Cancel',
        NO_CATEGORY: 'No category selected'
    };

    const researchItemTypes = {
        ACCOMPLISHMENT: 'accomplishment',
        DOCUMENT: 'document'
    };

    const pathProfileImages = '/profile/images';

    const genders = {
        'F': 'Female',
        'M': 'Male'
    };

    angular.module('app')
        .constant('pageSize', 50)
        .constant('userConstants', userConstants)
        .constant('config', config)
        .constant('DocumentLabels', DocumentLabels)
        .constant('apiPrefix', apiPrefix)
        .constant('documentSourceTypes', documentSourceTypes)
        .constant('documentTypes', documentTypes)
        .constant('groupTypes', groupTypes)
        .constant('groupTypeLabels', groupTypeLabels)
        .constant('groupTypePluralLabels', groupTypePluralLabels)
        .constant('documentSearchForm', documentSearchForm)
        .constant('documentFieldsRules', documentFieldsRules)
        .constant('documentOrigins', documentOrigins)
        .constant('documentListSections', documentListSections)
        .constant('documentCategories', documentCategories)
        .constant('documentActions', documentActions)
        .constant('researchItemTypes', researchItemTypes)
        .constant('pathProfileImages', pathProfileImages)
        .constant('genders', genders);
})();
