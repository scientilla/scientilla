(function () {
    'use strict';


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
        }
    };

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

    const apiPrefix = '/api/v1';

    angular.module('app')
        .constant('pageSize', 10)
        .constant('documentSearchForm', documentSearchForm)
        .constant('userConstants', userConstants)
        .constant('config', config)
        .constant('publicationTypes', publicationTypes)
        .constant('DocumentLabels', DocumentLabels)
        .constant('apiPrefix', apiPrefix);
})();