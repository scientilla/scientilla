(function () {
    'use strict';

    const userConstants = {
        role: {
            USER: 'user',
            ADMINISTRATOR: 'administrator',
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
        UVERIFYING: 'unverifying',
        NEW: 'new'
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
            matchRule: 'contains'
        },
        author: {
            inputType: 'text',
            label: 'Author',
            matchColumn: 'authorsStr',
            matchRule: 'contains'
        },
        maxYear: {
            inputType: 'year',
            label: 'Year from',
            matchColumn: 'year',
            matchRule: '>='
        },
        minYear: {
            inputType: 'year',
            label: 'Year to',
            matchColumn: 'year',
            matchRule: '<='
        },
        documentType: {
            inputType: 'select',
            label: 'Document Type',
            values: _.concat(
                [{value: "?", label: 'Select'}],
                documentTypes.map(s => ({value: s.key, label: s.label}))
            ),
            matchColumn: 'type'
        },
        sourceType: {
            inputType: 'select',
            label: 'Source Type',
            values: _.concat(
                [{value: "?", label: 'Select'}],
                documentSourceTypes.filter(t => t.type === 'scientific').map(s => ({value: s.id, label: s.label}))
            ),
            matchColumn: 'sourceType'
        }

    };

    const documentFieldsRules = {
        authorsStr: {
            allowNull: false,
            regex: /^((\w|-|')+(\s(\w|-|')+)*((\s|-)?\w\.)+)(,\s(\w|-|')+(\s(\w|-|')+)*((\s|-)?\w\.)+)*$/
        },
        scopusId: {
            allowNull: true,
            regex: /^\d*$/
        }
    };

    const apiPrefix = '/api/v1';

    angular.module('app')
        .constant('pageSize', 10)
        .constant('userConstants', userConstants)
        .constant('config', config)
        .constant('DocumentLabels', DocumentLabels)
        .constant('apiPrefix', apiPrefix)
        .constant('documentSourceTypes', documentSourceTypes)
        .constant('documentTypes', documentTypes)
        .constant('documentSearchForm', documentSearchForm)
        .constant('documentFieldsRules', documentFieldsRules);
})();