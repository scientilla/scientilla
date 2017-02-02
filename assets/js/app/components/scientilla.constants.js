(function () {
    'use strict';


    var yearsInterval = _.range(new Date().getFullYear(), 2005, -1);


    var years_value = _.concat(
        [{value: "?", label: 'Select'}],
        _.map(yearsInterval, function (y) {
            return {value: y + '', label: y + ''};
        }));
    var documentSearchForm = {
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
            inputType: 'select',
            label: 'Year from',
            values: years_value,
            matchColumn: 'year',
            matchRule: '>='
        },
        minYear: {
            inputType: 'select',
            label: 'Year to',
            values: years_value,
            matchColumn: 'year',
            matchRule: '<='
        }
    };

    var userConstants = {
        role: {
            USER: 'user',
            ADMINISTRATOR: 'administrator',
        }
    };

    // TODO change to configuration webservice
    var config = {
        mainInstitute: {
            id: 1,
            shortname: 'IIT'
        }
    };

    var publicationTypes = [
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

    angular.module('components')
        .constant('pageSize', 10)
        .constant('yearsInterval', yearsInterval)
        .constant('documentSearchForm', documentSearchForm)
        .constant('userConstants', userConstants)
        .constant('config', config)
        .constant('publicationTypes', publicationTypes);
})();