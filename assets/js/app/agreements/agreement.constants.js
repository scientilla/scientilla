/* global angular */

const agreementListSections = {
    VERIFIED: 'verified-agreements',
    DRAFT: 'draft-list-agreements',
    GROUP: 'group-verified-agreements',
};

angular.module('app')
    .constant('agreementListSections', agreementListSections);