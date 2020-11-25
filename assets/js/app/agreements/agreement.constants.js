/* global angular */

const agreementListSections = {
    VERIFIED: 'verified-accomplishments',
    DRAFT: 'draft-list-accomplishments',
    GROUP: 'group-verified-agreements',
};

angular.module('app')
    .constant('agreementListSections', agreementListSections);