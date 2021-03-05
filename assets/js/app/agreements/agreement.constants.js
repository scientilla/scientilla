/* global angular */

const agreementListSections = {
    VERIFIED: 'verified-agreements',
    DRAFT: 'draft-list-agreements',
    GROUP: 'group-verified-agreements',
};

const agreementTypes = [
    {
        key: 'implementing',
        label: 'Implementing'
    }, {
        key: 'institutional',
        label: 'Institutional'
    }, {
        key: 'research',
        label: 'Research'
    }, {
        key: 'management',
        label: 'Management / Quadro?'
    }
];

const agreementFieldRules = {
    piStr: {
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
    }
};

const agreementRequiredFields = [
    'title',
    'agreementType',
    'partners',
    'pis',
    'piStr',
    'startDate'
];

const agreementFields = [
    'startYear',
    'endYear',
    'piStr',
    'projectData',
    'type'
];

const agreementDownloadFileName = 'Agreement_Export.csv';

const agreementExportUrl = '/api/v1/agreements/export';

angular.module('app')
    .constant('agreementListSections', agreementListSections)
    .constant('agreementTypes', agreementTypes)
    .constant('agreementFieldRules', agreementFieldRules)
    .constant('agreementRequiredFields', agreementRequiredFields)
    .constant('agreementFields', agreementFields)
    .constant('agreementDownloadFileName', agreementDownloadFileName)
    .constant('agreementExportUrl', agreementExportUrl);