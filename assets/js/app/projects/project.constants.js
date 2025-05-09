/* global angular */

const projectListSections = {
    SUGGESTED: 'suggested-projects',
    VERIFIED: 'verified-projects',
    GROUP: 'group-verified-projects',
    USER: 'user-verified-projects'
};

const allProjectTypes = {
    value: 'all',
    label: 'All'
};

const projectTypeCompetitive = 'project_competitive';
const projectTypeIndustrial = 'project_industrial';
const projectTypeAgreement = 'project_agreement';

const industrialProjectCategories = {
    'Sales': 'Sales',
    'Research': 'Research',
    'Joint Lab': 'Joint Lab',
    'Service': 'Service',
    'Educational': 'Educational',
    'Lease': 'Lease',
    'Inkind': 'Inkind'
};

const industrialProjectPayments = {
    'InCash': 'in cash',
    'InKind': 'in kind',
    'inCash/inKind': 'in cash / in kind',
};

const projectStatuses = {
    'ended': 'Ended',
    'working': 'Working'
};

const competitiveProjectFundings = {
    'Others': 'Others',
    'Foundation': 'Foundation',
    'European': 'European',
    'International': 'International',
    'National': 'National',
    'In Kind': 'In kind',
    'Unknown project type': 'Unknown'
};

const projectExportUrl = '/api/v1/projects/export';

angular.module('app')
    .constant('projectListSections', projectListSections)
    .constant('allProjectTypes', allProjectTypes)
    .constant('projectTypeCompetitive', projectTypeCompetitive)
    .constant('projectTypeIndustrial', projectTypeIndustrial)
    .constant('projectTypeAgreement', projectTypeAgreement)
    .constant('industrialProjectCategories', industrialProjectCategories)
    .constant('industrialProjectPayments', industrialProjectPayments)
    .constant('projectStatuses', projectStatuses)
    .constant('competitiveProjectFundings', competitiveProjectFundings)
    .constant('projectExportUrl', projectExportUrl);
