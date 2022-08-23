/* global angular */

const phdTrainingListSections = {
    SUGGESTED: 'suggested-phd-trainings',
    VERIFIED: 'verified-phd-trainings',
    GROUP: 'group-verified-phd-trainings',
    USER: 'user-verified-phd-trainings'
};

angular.module('phdTrainings')
    .constant('phdTrainingListSections', phdTrainingListSections);
