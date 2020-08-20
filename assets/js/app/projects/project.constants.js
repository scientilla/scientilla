/* global angular */
const allProjectTypes = {
    value: 'all',
    label: 'All'
};

const projectTypeCompetitive = 'project_competitive';

const projectTypeIndustrial = 'project_industrial';

const industrialProjectCategories = {
    'Ricerca': 'Research',
    'Formazione': 'Training',
    'Locazioni': 'Leases',
    'Joint Lab': 'Joint lab',
    'Vendita': 'Sale',
    'Servizio': 'Service',
};

const industrialProjectPayments = {
    'InCash': 'In cash'
};

const projectStatuses = {
    'ended': 'Ended',
    'working': 'Working'
};

angular.module('app')
    .constant('allProjectTypes', allProjectTypes)
    .constant('projectTypeCompetitive', projectTypeCompetitive)
    .constant('projectTypeIndustrial', projectTypeIndustrial)
    .constant('industrialProjectCategories', industrialProjectCategories)
    .constant('industrialProjectPayments', industrialProjectPayments)
    .constant('projectStatuses', projectStatuses);