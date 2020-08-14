/* global angular */
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

angular.module('app')
    .constant('projectTypeCompetitive', projectTypeCompetitive)
    .constant('projectTypeIndustrial', projectTypeIndustrial)
    .constant('industrialProjectCategories', industrialProjectCategories)
    .constant('industrialProjectPayments', industrialProjectPayments);