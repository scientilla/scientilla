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

const allPatentTypes = {
    value: 'all',
    label: 'All'
};

const patentTypePriorities = 'priorities';
const patentTypeProsecutions = 'prosecutions';

angular.module('app')
    .constant('patentListSections', patentListSections)
    .constant('patentFamilyListSections', patentFamilyListSections)
    .constant('allPatentTypes', allPatentTypes)
    .constant('patentTypePriorities', patentTypePriorities)
    .constant('patentTypeProsecutions', patentTypeProsecutions);