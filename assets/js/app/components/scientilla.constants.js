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


    angular.module('components')
        .constant('pageSize', 10)
        .constant('yearsInterval', yearsInterval)
        .constant('documentSearchForm', documentSearchForm)
        .constant('userConstants', userConstants)
        .constant('config', config);
})();