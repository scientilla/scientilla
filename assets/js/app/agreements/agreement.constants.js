/* global angular */

const agreementListSections = {
    VERIFIED: 'verified-agreements',
    DRAFT: 'draft-list-agreements',
    GROUP: 'group-verified-agreements',
};

const agreementTypes = [
    {
        key: 'framework',
        label: 'Framework'
    }, {
        key: 'institutional',
        label: 'Institutional'
    }, {
        key: 'research',
        label: 'Research'
    }, {
        key: 'executive',
        label: 'Executive'
    }, {
        key: 'other',
        label: 'Other'
    }
];

const agreementFieldRules = {
    authorsStr: {
        regex: /^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)*$/,
        message: 'Author string is not valid. It should be in the form \"Molinari E., Bozzini F., Semprini F.\".'
    },
    startDate: {
        isDate: true,
        message: 'Not a valid date.'
    },
    endDate: {
        allowNull: true,
        isDate: true,
        message: 'Not a valid date.'
    },
    link: {
        regex: /^(http|https):\/\//,
        message: 'This link should start with http:// or https://'
    }
};

const agreementRequiredFields = [
    'acronym',
    'title',
    'type',
    'partners',
    'pis',
    'authorsStr',
    'startDate'
];

const agreementFields = [
    'startYear',
    'endYear',
    'authorsStr',
    'projectData',
    'type'
];

const agreementDownloadFileName = 'Agreements_Export.csv';

const agreementExportUrl = '/api/v1/agreements/export';

angular.module('app')
    .constant('agreementListSections', agreementListSections)
    .constant('agreementTypes', agreementTypes)
    .constant('agreementFieldRules', agreementFieldRules)
    .constant('agreementRequiredFields', agreementRequiredFields)
    .constant('agreementFields', agreementFields)
    .constant('agreementDownloadFileName', agreementDownloadFileName)
    .constant('agreementExportUrl', agreementExportUrl);
