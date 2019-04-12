/*global angular*/

const researchItemLabels = {
    UVERIFYING: 'unverifying',
    EXTERNAL: 'external',
    DISCARDED: 'discarded',
};

const researchItemKinds = {
    DRAFT: 'd',
    VERIFIED: 'v',
    EXTERNAL: 'e',
    IGNORED: 'i'
};

angular.module('app')
    .constant('researchItemKinds', researchItemKinds)
    .constant('researchItemLabels', researchItemLabels);

