/* global angular */

const agreementListSections = {
    VERIFIED: 'verified-agreements',
    GROUP: 'group-verified-agreements',
};

angular.module('app')
    .constant('agreementListSections', agreementListSections);