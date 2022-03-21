/* global angular */

const projectListSections = {
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

const competitiveProjectActions = {
    'TEMPUS': 'TEMPUS',
    'Simons Foundation': 'Simons Foundation',
    'ONR': 'ONR',
    'CARIPLO': 'CARIPLO',
    'Coordination & Support': 'Coordination & Support',
    'ERASMUS': 'ERASMUS',
    'Others': 'Others',
    'AIRC IG': 'AIRC IG',
    '6th Collaborative Old': '6th Collaborative Old',
    'Worldwide Cancer Research': 'Worldwide Cancer Research',
    'ESA': 'ESA',
    'POR-Campania': 'POR-Campania',
    'ENIAC': 'ENIAC',
    'Collaborative': 'Collaborative',
    'POR-Piemonte': 'POR-Piemonte',
    'Fondation La Motrice': 'Fondation La Motrice',
    'AriSLA': 'AriSLA',
    'Fondazione Roma': 'Fondazione Roma',
    'FIRB': 'FIRB',
    'Provincia Autonoma Trento': 'Provincia Autonoma Trento',
    'PON mise': 'PON mise',
    'INAIL': 'INAIL',
    'Min. Salute': 'Min. Salute',
    'CARIPLO Reg Lombardia': 'CARIPLO Reg Lombardia',
    'Innovation': 'Innovation',
    'FLAG-ERA': 'FLAG-ERA',
    'ERC': 'ERC',
    'Other International Projects': 'Other International Projects',
    'Marie Curie': 'Marie Curie',
    'Fondazione Vodafone Italia': 'Fondazione Vodafone Italia',
    'Research & Innovation': 'Research & Innovation',
    'ASI': 'ASI',
    'FET': 'FET',
    'POR-Lombardia': 'POR-Lombardia',
    'San paolo': 'San paolo',
    'MDA': 'MDA',
    'MAE grande rilevanza Italia - Israele': 'MAE grande rilevanza Italia - Israele',
    'Marie Curie European Fellowship': 'Marie Curie European Fellowship',
    'MJFox': 'MJFox',
    'POR Piemonte_Fabbrica Intelligente': 'POR Piemonte_Fabbrica Intelligente',
    'POR-Liguria': 'POR-Liguria',
    'NIH': 'NIH',
    'Foundation for Prader-Willi Research': 'Foundation for Prader-Willi Research',
    'Other EU project': 'Other EU project',
    'Fondation Thierry Latran': 'Fondation Thierry Latran',
    'Fondation Jerome Lejeune': 'Fondation Jerome Lejeune',
    'Galileo (MIUR)': 'Galileo (MIUR)',
    'Graphene flagship': 'Graphene flagship',
    'COST': 'COST',
    'Fondation ELA': 'Fondation ELA',
    'NARSAD Indipendent Investigator Grant': 'NARSAD Indipendent Investigator Grant',
    'PCM-DPA': 'PCM-DPA',
    'TELETHON': 'TELETHON',
    'MAE grande rilevanza': 'MAE grande rilevanza',
    'POR Toscana': 'POR Toscana',
    'LIFE2020': 'LIFE2020',
    'AIRC Fellowship': 'AIRC Fellowship',
    'PON Infrastrutture': 'PON Infrastrutture',
    'H2020 MSCA - NIGHT': 'H2020 MSCA - NIGHT',
    'BANDIERA': 'BANDIERA',
    'MRS FOUNDATION': 'MRS FOUNDATION',
    'AIRC CARIPLO TRIDEO': 'AIRC CARIPLO TRIDEO',
    'POR Puglia': 'POR Puglia',
    'PRIN': 'PRIN',
    'inail generico': 'inail generico',
    'Progetto In Kind': 'Progetto In Kind',
    'CARIFI': 'CARIFI',
    'European Infrastructure': 'European Infrastructure',
    'AIRC MFAG': 'AIRC MFAG',
    'PON Distretti': 'PON Distretti',
    'PON Ricerca': 'PON Ricerca',
    'Vda': 'Vda',
    'Fondazione Italiana Sclerosi Multipla': 'Fondazione Italiana Sclerosi Multipla',
    'Coordination and Support Action': 'Coordination and Support Action',
    'Flagships': 'Flagships',
    'Other Foundation projects': 'Other Foundation projects',
    'FAS Toscana': 'FAS Toscana',
};

const competitiveProjectDownloadFileName = 'Competitive_Projects_Export.csv';
const industrialProjectDownloadFileName = 'Industrial_Projects_Export.csv';

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
    .constant('competitiveProjectActions', competitiveProjectActions)
    .constant('competitiveProjectDownloadFileName', competitiveProjectDownloadFileName)
    .constant('industrialProjectDownloadFileName', industrialProjectDownloadFileName)
    .constant('projectExportUrl', projectExportUrl);
