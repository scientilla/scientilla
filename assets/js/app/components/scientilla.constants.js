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

    const publicationTypes = [
        {
            value: 'book-chapter',
            label: 'Book chapter'
        },
        {
            value: 'book-whole',
            label: 'Book Whole'
        },
        {
            value: 'full-paper-volume-at-refereed-conference',
            label: 'Full Paper / Volume at Refereed Conference'
        },
        {
            value: 'short-paper-abstract-at-refereed-conference',
            label: 'Short Paper / Abstract at Refereed Conference'
        },
        {
            value: 'masters-thesis',
            label: 'Master\'s Thesis'
        },
        {
            value: 'phd-thesis',
            label: 'Ph.D. Thesis'
        },
        {
            value: 'national-journal',
            label: 'National Journal'
        },
        {
            value: 'international-journal',
            label: 'International Journal'
        },
        {
            value: 'collection',
            label: 'Collection'
        },
        {
            value: 'report',
            label: 'Report'
        },
        {
            value: 'correction',
            label: 'Correction'
        },
        {
            value: 'editorial',
            label: 'Editorial'
        },
        {
            value: 'supp-information',
            label: 'Supplementary Information'
        },
        {
            value: 'talks',
            label: 'Invited Talks'
        },
        //{value:'patent', label: 'Patent'},
    ];

    const DocumentLabels = {
        DUPLICATE: 'duplicate',
        ALREADY_VERIFIED: 'already verified',
        DISCARDED: 'discarded',
        UVERIFYING: 'unverifying'
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
        }
    ];

    const documentSourceTypes = [
        {id: 'book', label: 'Book'},
        {id: 'journal', label: 'Journal'},
        {id: 'conference', label: 'Conference'},
        {id: 'bookseries', label: 'Book Series'},
        {id: 'scientific_conference', label: 'Conference', section: 'Scientific Event'},
        {id: 'institute', label: 'Institute', section: 'Scientific Event'},
        {id: 'workshop', label: 'Workshop', section: 'Scientific Event'},
        {id: 'school', label: 'School (Summer school, ...)', section: 'Scientific Event'},
        {id: 'media', label: 'Media', section: 'Dissemination'},
        {id: 'public_event', label: 'Public Event', section: 'Dissemination'},
        {id: 'outreach', label: 'Outreach', section: 'Dissemination'}
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
            matchColumn: 'type',
            matchRule: 'like'
        },
        sourceType: {
            inputType: 'select',
            label: 'Source Type',
            values: _.concat(
                [{value: "?", label: 'Select'}],
                documentSourceTypes.map(s => ({value: s.id, label: s.label}))
            ),
            matchColumn: 'sourceType',
            matchRule: 'like'
        }

    };

    const apiPrefix = '/api/v1';

    angular.module('app')
        .constant('pageSize', 10)
        .constant('userConstants', userConstants)
        .constant('config', config)
        .constant('publicationTypes', publicationTypes)
        .constant('DocumentLabels', DocumentLabels)
        .constant('apiPrefix', apiPrefix)
        .constant('documentSourceTypes', documentSourceTypes)
        .constant('documentTypes', documentTypes)
        .constant('documentSearchForm', documentSearchForm);
})();