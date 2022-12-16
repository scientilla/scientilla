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

const competitiveProjectActions = {
    '6th Collaborative Prj': '6th Collaborative Prj',
    'AIRC CARIPLO TRIDEO': 'AIRC CARIPLO TRIDEO',
    'AIRC Fellowship': 'AIRC Fellowship',
    'AIRC IG': 'AIRC IG',
    'AIRC MFAG': 'AIRC MFAG',
    'ASI': 'ASI',
    'AriSLA': 'AriSLA',
    'Armenise': 'Armenise',
    'BANDIERA': 'BANDIERA',
    'CARIFI': 'CARIFI',
    'CARIPLO': 'CARIPLO',
    'CARIPLO  RL': 'CARIPLO  RL',
    'CMP3_VDA': 'CMP3_VDA',
    'COST': 'COST',
    'ENIAC': 'ENIAC',
    'ERASMUS': 'ERASMUS',
    'ESA': 'ESA',
    'ESFRI': 'ESFRI',
    'FAS Toscana': 'FAS Toscana',
    'FETFlagship - Graphene': 'FETFlagship - Graphene',
    'FIRB': 'FIRB',
    'FISM': 'FISM',
    'FLAG-ERA': 'FLAG-ERA',
    'FP7 CP - CSA': 'FP7 CP - CSA',
    'FP7 CSA': 'FP7 CSA',
    'FP7 Collaborative': 'FP7 Collaborative',
    'FP7 ERC - AdvG': 'FP7 ERC - AdvG',
    'FP7 ERC - CoG': 'FP7 ERC - CoG',
    'FP7 ERC - StG': 'FP7 ERC - StG',
    'FP7 FET - Open': 'FP7 FET - Open',
    'FP7 People - CIG': 'FP7 People - CIG',
    'FP7 People - IOF 2011': 'FP7 People - IOF 2011',
    'FP7 People - IOF 2013': 'FP7 People - IOF 2013',
    'FP7 People - IRG': 'FP7 People - IRG',
    'FP7 People - IRSES': 'FP7 People - IRSES',
    'FP7 People - ITN 2011': 'FP7 People - ITN 2011',
    'FP7 People - ITN 2012/13': 'FP7 People - ITN 2012/13',
    'FP7 People IEF-IIF 12/13': 'FP7 People IEF-IIF 12/13',
    'Fondation ELA': 'Fondation ELA',
    'Fondation Jerome Lejeune': 'Fondation Jerome Lejeune',
    'Fondation La Motrice': 'Fondation La Motrice',
    'Fondation Thierry Latran': 'Fondation Thierry Latran',
    'Fondazione Roma': 'Fondazione Roma',
    'Fondazione Vodafone': 'Fondazione Vodafone',
    'Foundation projects': 'Foundation projects',
    'Galileo (MIUR)': 'Galileo (MIUR)',
    'H2020 - Shift2Rail - RIA': 'H2020 - Shift2Rail - RIA',
    'H2020 CSA': 'H2020 CSA',
    'H2020 ERC - AdvG': 'H2020 ERC - AdvG',
    'H2020 ERC - CoG': 'H2020 ERC - CoG',
    'H2020 ERC - PoCG': 'H2020 ERC - PoCG',
    'H2020 ERC - StG': 'H2020 ERC - StG',
    'H2020 ERC - SyG': 'H2020 ERC - SyG',
    'H2020 FET - Flagship': 'H2020 FET - Flagship',
    'H2020 FET - Open': 'H2020 FET - Open',
    'H2020 FET - Proactive': 'H2020 FET - Proactive',
    'H2020 IA': 'H2020 IA',
    'H2020 MSCA - COFUND': 'H2020 MSCA - COFUND',
    'H2020 MSCA - IF GF': 'H2020 MSCA - IF GF',
    'H2020 MSCA - IF- EF': 'H2020 MSCA - IF- EF',
    'H2020 MSCA - ITN': 'H2020 MSCA - ITN',
    'H2020 MSCA - ITN 2019': 'H2020 MSCA - ITN 2019',
    'H2020 MSCA - NIGHT': 'H2020 MSCA - NIGHT',
    'H2020 MSCA - RISE': 'H2020 MSCA - RISE',
    'H2020 RIA': 'H2020 RIA',
    'HE': 'HE',
    'HE ERC PoC': 'HE ERC PoC',
    'HE MSCA DN': 'HE MSCA DN',
    'HE MSCA PF - EF': 'HE MSCA PF - EF',
    'HE MSCA PF - GF': 'HE MSCA PF - GF',
    'HE_test (ERC)': 'HE_test (ERC)',
    'IN KIND': 'IN KIND',
    'INAIL': 'INAIL',
    'INAIL_Rehab': 'INAIL_Rehab',
    'MAE Italia - Israele': 'MAE Italia - Israele',
    'MAE grande rilevanza': 'MAE grande rilevanza',
    'MDA': 'MDA',
    'MITE': 'MITE',
    'MJFF': 'MJFF',
    'MJFox': 'MJFox',
    'MRS FOUNDATION': 'MRS FOUNDATION',
    'Min. Salute': 'Min. Salute',
    'NARSAD IIG': 'NARSAD IIG',
    'NIH': 'NIH',
    'ONR': 'ONR',
    'Other EU project': 'Other EU project',
    'Other Intern. Projects': 'Other Intern. Projects',
    'Other National projects': 'Other National projects',
    'Others': 'Others',
    'PAT': 'PAT',
    'PCM-DPA': 'PCM-DPA',
    'PON Distretti': 'PON Distretti',
    'PON Infrastrutture': 'PON Infrastrutture',
    'PON Mise': 'PON Mise',
    'PON Ricerca': 'PON Ricerca',
    'POR Piemonte_Fabbr. Intel': 'POR Piemonte_Fabbr. Intel',
    'POR Puglia': 'POR Puglia',
    'POR-Campania': 'POR-Campania',
    'POR-Liguria': 'POR-Liguria',
    'POR-Lombardia': 'POR-Lombardia',
    'POR-Piemonte': 'POR-Piemonte',
    'PORToscana': 'PORToscana',
    'POR_Lazio': 'POR_Lazio',
    'PRIN': 'PRIN',
    'PWR': 'PWR',
    'SIMONS FOUNDATION': 'SIMONS FOUNDATION',
    'San Paolo': 'San Paolo',
    'TELETHON': 'TELETHON',
    'TEMPUS': 'TEMPUS',
    'TargetALS Foundation': 'TargetALS Foundation',
    'WCR': 'WCR'
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
