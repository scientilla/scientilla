/* global angular */

const patentListSections = {
    VERIFIED: 'verified-patents',
    GROUP: 'group-verified-patents',
    USER: 'user-verified-patents'
};

const patentFamilyListSections = {
    VERIFIED: 'verified-patent-families',
    GROUP: 'group-verified-patent-families',
    USER: 'user-verified-patent-families'
};

angular.module('app')
    .constant('patentListSections', patentListSections)
    .constant('patentFamilyListSections', patentFamilyListSections);