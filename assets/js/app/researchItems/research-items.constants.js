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

const researchItemTypes = {
    ACCOMPLISHMENT: 'accomplishment',
    DOCUMENT: 'document',
    PATENT: 'patent',
    PROJECT: 'project'
};

const authorLimit = 10;

angular.module('app')
    .constant('researchItemKinds', researchItemKinds)
    .constant('researchItemLabels', researchItemLabels)
    .constant('researchItemTypes', researchItemTypes)
    .constant('authorLimit', authorLimit);

