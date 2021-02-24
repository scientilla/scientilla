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

angular.module('app')
    .constant('agreementListSections', agreementListSections)
    .constant('agreementTypes', agreementTypes);