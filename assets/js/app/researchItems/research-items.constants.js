/*global angular*/

const researchItemLabels = {
    NEW: 'new',
    UVERIFYING: 'unverifying',
    EXTERNAL: 'external',
    DISCARDED: 'discarded',
    ALREADY_IN_DRAFTS: 'already in drafts',
};

const researchItemKinds = {
    DRAFT: 'd',
    VERIFIED: 'v',
    EXTERNAL: 'e',
    IGNORED: 'i'
};

const authorLimit = 10;

angular.module('app')
    .constant('researchItemKinds', researchItemKinds)
    .constant('researchItemLabels', researchItemLabels)
    .constant('authorLimit', authorLimit);

