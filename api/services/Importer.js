/* global Source, User, Group, SourceMetric, SourceTypes, Attribute, GroupAttribute, PrincipalInvestigator */
/* global MembershipGroup, GroupTypes, ResearchEntityData, ResearchItemTypes, ResearchItem, ResearchItemKinds, Project */
/* global Verify, Membership, MembershipGroup, GroupTypes, ResearchEntityData, Utils, Patent */
/* global GeneralSetting */

// Importer.js - in api/services

"use strict";

module.exports = {
    importSources,
    importGroups,
    importSourceMetrics,
    importDirectorates,
    importProjects,
    importPatents,
};

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const request = require('request-promise');

const moment = require('moment');
moment.locale('en');

async function importSources() {

    function readWorksheet(worksheet, mappingsTable, mapFn = _.identity, filterFn = _.stubTrue) {
        function readSourceRow(r) {
            const sourceData = {};
            _.forEach(mappingsTable, (col, field) => {
                const cell = col + r;
                if (!_.isUndefined(worksheet[cell]))
                    sourceData[field] = worksheet[cell]['v'];
            });
            return sourceData;
        }

        const sources = [];
        for (let r = 2; ; r++) {
            const sourceData = readSourceRow(r);
            if (_.isEmpty(sourceData))
                break;
            const mappedSourceData = mapFn(sourceData);
            if (filterFn(mappedSourceData))
                sources.push(mappedSourceData);
        }
        return sources;
    }

    const scopusSourcesFileName = 'config/init/scopus_sources.xlsx';
    let journalsAndBookSeries = [], newConferences = [], oldConferences = [];
    if (fs.existsSync(scopusSourcesFileName)) {
        const workbook = xlsx.readFile(scopusSourcesFileName);
        const sheetNameList = workbook.SheetNames;

        const journalWorksheet = workbook.Sheets[sheetNameList[0]];
        const journalMappingsTable = {
            "title": 'B',
            "scopusId": 'A',
            "issn": 'C',
            "eissn": 'D',
            "type": 'T',
            "publisher": 'Z'
        };

        const mapJournal = (s) => {
            const sourceMappingTable = {
                'Book Series': SourceTypes.BOOKSERIES,
                'Journal': SourceTypes.JOURNAL
            };
            s.type = sourceMappingTable[s.type];
            return s;
        };

        const filterJournals = (s) => s.type;

        journalsAndBookSeries = readWorksheet(journalWorksheet, journalMappingsTable, mapJournal, filterJournals);

        const newConferencesWorksheet = workbook.Sheets[sheetNameList[1]];
        const newConferencesMappingsTable = {
            "title": 'B',
            "scopusId": 'A',
            "issn": 'D'
        };
        const mapConference = s => {
            s.type = SourceTypes.CONFERENCE;
            return s;
        };
        newConferences = readWorksheet(newConferencesWorksheet, newConferencesMappingsTable, mapConference);

        const oldConferencesWorksheet = workbook.Sheets[sheetNameList[2]];
        oldConferences = readWorksheet(oldConferencesWorksheet, newConferencesMappingsTable, mapConference);
    }


    let books = [];
    const scopusSourcesFileName2 = 'config/init/scopus_book_sources.xlsx';
    if (fs.existsSync(scopusSourcesFileName2)) {
        const workbook2 = xlsx.readFile(scopusSourcesFileName2);
        const sheetNameList2 = workbook2.SheetNames;

        const bookWorksheet = workbook2.Sheets[sheetNameList2[0]];
        const bookMappingsTable = {
            "title": 'A',
            "isbn": 'C',
            "publisher": 'D',
            "year": 'E'
        };

        const mapBook = (s) => {
            s.type = 'book';
            return s;
        };

        books = readWorksheet(bookWorksheet, bookMappingsTable, mapBook);
    }

    const sources = _.union(journalsAndBookSeries, newConferences, oldConferences, books);

    sails.log.info('Inserting ' + sources.length + ' new sources');
    await Source.create(sources);
}

async function importGroups() {
    sails.log.info('Group import started');

    const researchDomains = [];
    const url = sails.config.scientilla.mainInstituteImport.officialGroupsImportUrl;
    const reqOptions = {
        uri: url,
        json: true,
        rejectUnauthorized: false
    };

    let res;
    try {
        res = await request(reqOptions);
    } catch (e) {
        sails.log.debug('importGroups');
        sails.log.debug(e);
    }
    // Store data in variables:
    const {
        research_domains: researchDomainsData,
        research_structures: researchStructuresData
    } = res;

    // Delete attribute records with category='research_domain' & where the key is not in the researchDomainsData array
    await Attribute.destroy({
        key: {'!': researchDomainsData.map(rd => rd.code)},
        category: 'research_domain'
    });

    // Loop over the research domains
    for (const rdData of researchDomainsData) {
        // Find or create one with key and category
        let researchDomain = await Attribute.findOrCreate({
            key: rdData.code,
            category: 'research_domain'
        });

        // Set the value of the attribute record
        researchDomain = await Attribute.update({id: researchDomain.id}, {value: rdData});

        // Push the domain to the array
        researchDomains.push(researchDomain[0]);
    }

    // Loop over the structures
    for (const rsData of researchStructuresData) {
        // Find or create a group with the code
        const group = await Group.findOrCreate({code: rsData.cdr});

        // Update the group record with the data
        await Group.update({id: group.id}, {
            name: rsData.description,
            type: rsData.type,
            starting_date: rsData.start_date,
            slug: rsData.slug,
            active: true
        });

        // PI
        // Check if the pis property is array and not empty
        if (Array.isArray(rsData.pis) && rsData.pis.length > 0) {
            const pis = await User.find({username: rsData.pis.map(p => p.email)});

            if (pis && pis.length) {

                // Delete all the records in the database table that are not matching the data
                await PrincipalInvestigator.destroy({
                    group: group.id,
                    pi: {'!': pis.map(p => p.id)}
                });

                // Loop over the found users
                for (const pi of pis) {
                    // Find of create a group administrator with the data
                    await GroupAdministrator.findOrCreate({
                        administrator: pi.id,
                        group: group.id
                    });

                    // Find of create a principal investigator with the data
                    await PrincipalInvestigator.findOrCreate({
                        pi: pi.id,
                        group: group.id
                    });
                }
            } else
                // No users found with a matching email address => delete PI record in the database table
                await PrincipalInvestigator.destroy({group: group.id});
        } else
            // No PIs? => delete them in the database table
            await PrincipalInvestigator.destroy({group: group.id});

        // Center
        // Find membership group records of group as child group and populate parent group
        const membershipGroups = await MembershipGroup.find({child_group: group.id}).populate('parent_group');
        // Get the membership group records of the centers
        const oldCentersMG = membershipGroups.filter(mg => mg.parent_group.type === GroupTypes.CENTER);

        // Check if structure has center and center code
        if (rsData.center && rsData.center.code) {
            // Find or create a group with center code
            const center = await Group.findOrCreate({code: rsData.center.code});
            // Update the group with center data
            await Group.update({id: center.id}, {
                name: rsData.center.name,
                type: GroupTypes.CENTER,
            });

            // Collect the ids of the membership group records of the centers where the parent group
            // is not equal to the center
            const toDeleteIds = oldCentersMG.filter(mg => mg.parent_group.id !== center.id).map(mg => mg.id);
            if (toDeleteIds.length > 0)
                // Delete them
                await MembershipGroup.destroy({id: toDeleteIds});

            // Check if we find a record where the parent group is equal to the center
            if (!oldCentersMG.find(mg => mg.parent_group.id === center.id)) {
                // If not, we create a record
                const membershipGroup = await MembershipGroup.findOrCreate({
                    parent_group: center.id,
                    child_group: group.id
                });

                await MembershipGroup.update({id: membershipGroup.id}, {
                    active: true
                });
            }

            // Create membership group between center and main institute
            const membershipGroup = await MembershipGroup.findOrCreate({
                parent_group: 1,
                child_group: center.id
            });

            await MembershipGroup.update({id: membershipGroup.id}, {
                active: true
            });
        } else
            // If the structure has no center: delete
            await MembershipGroup.destroy({child_group: oldCentersMG.map(mg => mg.id)});

        // Research domains and interactions
        // If structure data has main research domain
        if (rsData.main_research_domain) {
            // Clear the research domains of type 'main'
            await clearResearchDomains([rsData.main_research_domain.code], group, 'main');
            // Add research domain
            await addResearchDomain(rsData.main_research_domain.code, group, 'main');
        } else
            // Clear the research domains
            await clearResearchDomains([], group, 'main');

        // Clear the research domains of type 'interaction'
        await clearResearchDomains(rsData.interactions.map(i => i.code), group, 'interaction');
        // Loop over structure interactions
        for (const ird of rsData.interactions)
            // Add research domain of type 'interaction'
            await addResearchDomain(ird.code, group, 'interaction');
    }

    async function clearResearchDomains(correctRdCodes, group, type) {
        let res;
        if (!correctRdCodes.length)
            // If array is empty find group attributes by group
            res = await GroupAttribute.find({
                researchEntity: group.id
            });
        else
            // If correctRdCodes is not empty, find the group attributes by attribute is not in array
            // and research entity group
            res = await GroupAttribute.find({
                attribute: {
                    '!': researchDomains.filter(rd => correctRdCodes.includes(rd.key)).map(rd => rd.id),
                },
                researchEntity: group.id
            });

        //query language does not support JSON
        // Filter the ids from array where extra property is not existing or extra type is type
        const toDeleteIds = res.filter(ga => !ga.extra || ga.extra.type === type).map(ga => ga.id);
        if (toDeleteIds.length)
            await GroupAttribute.destroy({id: toDeleteIds});
    }

    // Function to add research domain
    async function addResearchDomain(rdCode, group, type) {
        // Search for research domain in array by code
        const rd = researchDomains.find(rd => rd.key === rdCode);

        // If found
        if (rd) {
            // Find group attribute with data
            const res = await GroupAttribute.find({attribute: rd.id, researchEntity: group.id});

            // Filter result where type of extra is type
            if (!res.filter(ga => ga.extra && ga.extra.type === type).length)
                // If not found, create group attribute with data
                await GroupAttribute.create({attribute: rd.id, researchEntity: group.id, extra: {type}});
        }
    }

    sails.log.info('Group import finished');
}

async function importSourceMetrics(filename) {
    const sourceIdentifiers = SourceMetric.sourceIdentifiers;

    const yearRegex = /^(19|20)\d{2}$/;

    const originCellCoord = 'B1';
    const yearCellCoord = 'D1';

    let recordsCount = 0;

    const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const filePath = 'metrics_import/' + filename;

    let workbook;
    let year;

    if (fs.existsSync(filePath)) {
        try {
            workbook = xlsx.readFile(filePath);
        } catch (err) {
            sails.log.info('Source metrics import stopped: Unsupported file!');
        }
        const sheetNameList = workbook.SheetNames;

        const workSheet = workbook.Sheets[sheetNameList[0]];

        if (!workSheet[originCellCoord] || !workSheet[yearCellCoord]) {
            sails.log.info('Source metrics import stopped: Invalid file format!');
        }

        const origin = workSheet[originCellCoord].v;
        if (origin !== 'wos' && origin !== 'scopus') {
            sails.log.info('The origin on cell ' + originCellCoord + ' is not valid!');
        }

        year = workSheet[yearCellCoord].v;
        if (!yearRegex.test(year)) {
            sails.log.info('The year on cell ' + yearCellCoord + ' is not valid!');
        }

        const columnsMapping = {};

        for (const c of cols) {
            const colNameCell = workSheet[c + '2'];
            if (!colNameCell)
                break;

            columnsMapping[colNameCell.v] = c;
        }

        const keyColumns = Object.keys(columnsMapping).filter(c => sourceIdentifiers.includes(c));
        const valueColumns = Object.keys(columnsMapping).filter(c => !sourceIdentifiers.includes(c));

        let i = 3;
        while (true) {
            const workSheetRow = {};

            for (const colName in columnsMapping) {
                const col = columnsMapping[colName];
                const cellCoord = col + i;
                if (workSheet[cellCoord])
                    workSheetRow[colName] = workSheet[cellCoord].v;
            }

            if (workSheetRow.issn) {
                workSheetRow.issn = workSheetRow.issn + '';
                workSheetRow.issn = workSheetRow.issn.replace(/-/g, '');
            }
            if (workSheetRow.eissn) {
                workSheetRow.eissn = workSheetRow.eissn + '';
                workSheetRow.eissn = workSheetRow.eissn.replace(/-/g, '');
            }

            if (_.isEmpty(workSheetRow))
                break;

            i++;

            const baseRecord = {};

            for (const kc of keyColumns)
                if (workSheetRow[kc])
                    baseRecord[kc] = workSheetRow[kc];

            if (_.isEmpty(baseRecord))
                continue;

            baseRecord.year = year;
            baseRecord.origin = origin;

            for (const vc of valueColumns) {
                if (!workSheetRow[vc])
                    continue;

                const criteria = _.clone(baseRecord);
                criteria.name = vc;
                const record = _.clone(baseRecord);
                record.name = vc;
                record.value = workSheetRow[vc];
                await SourceMetric.createOrUpdate(criteria, record);
                recordsCount++;

                if (recordsCount % 1000 === 0)
                    sails.log.debug('source metrics inserted/updated: ' + recordsCount);
            }
        }
    } else {
        sails.log.info('Source metrics import stopped: File not found!');
    }

    sails.log.info('imported ' + recordsCount + ' records');
}

async function importDirectorates() {

    const groups = await Group.find();
    if (groups.length <= 0) {
        sails.log.info('No groups found...');
    }

    // Get all the employees from Pentaho.
    const options = UserImporter.getUserImportRequestOptions('employees');
    let employees = await UserImporter.getEmployees(options);

    if (!employees) {
        return;
    }

    employees = UserImporter.filterEmployees(employees);

    const directorates = [];
    const updatedDirectorates = [];
    const createdDirectorates = [];

    for (const employee of employees) {
        for (let i = 1; i < 7; i++) {
            if (!_.isEmpty(employee['linea_' + i])) {
                const code = employee['linea_' + i];
                const name = employee['nome_linea_' + i];
                const office = employee['UO_' + i];
                const directorate = directorates.find(d => d.code === code);
                const group = groups.find(g => g.code === code && g.type !== 'Directorate');

                if (!directorate && !group) {
                    directorates.push({
                        code: code,
                        name: name,
                        office: office
                    });
                }
            }
        }
    }

    for (const directorate of directorates) {
        const group = await Group.findOne({
            code: directorate.code,
            type: 'Directorate'
        });

        const groupData = {
            code: directorate.code,
            name: directorate.name,
            type: 'Directorate',
            description: null,
            //description: directorate.office, // Cannot because some codes have more offices like ROO001
            slug: directorate.name.toLowerCase().trim().replace(/\./gi, '-').split('@')[0]
        };

        if (group) {
            await Group.update({id: group.id}, groupData);
            updatedDirectorates.push(group);
        } else {
            groupData.active = false;
            await Group.create(groupData);
            createdDirectorates.push(groupData);
        }
    }

    sails.log.info(`Created ${createdDirectorates.length} & updated ${updatedDirectorates.length} directorates.
        Please add them to their parent group and check their active state!`);
}

// import Projects

async function importProjects() {
    const annualContributionSchema = {
        year: 'year',
        contribution: 'annual_contribution'
    };

    const membersSchema = {
        email: obj => obj.email.toLocaleLowerCase(),
        name: 'firstname',
        surname: 'lastname',
        role: obj => obj.flag_pi ? 'pi' : obj.flag_copi ? 'co_pi' : 'member',
        contributionPercentage: 'contribution_percentage',
        contributionObtained: 'contribution_obtained',
        "annualContribution": obj => mapObectsArray(
            obj.annual_contribution,
            annualContributionSchema
        )
    };
    const researchLinesSchema = {
        code: 'cdr',
        description: 'cdr_description',
        startDate: 'start_date',
        endDate: 'end_date',
        role: obj => obj.flag_pi ? 'pi' : obj.flag_copi ? 'co_pi' : 'member',
        contribution: 'contribution',
        contributionObtained: 'contribution_obtained',
        "annualContribution": obj => mapObectsArray(
            obj.annual_contribution,
            annualContributionSchema
        )
    };
    const partnersSchema = {
        description: 'description',
        budget: 'budget',
        contribution: 'contribution',
        "annualContribution": obj => mapObectsArray(
            obj.annual_contribution,
            annualContributionSchema
        )
    };

    const schemas = {
        [ResearchItemTypes.PROJECT_COMPETITIVE]: {
            code: 'sap_code',
            acronym: 'acronym',
            title: 'title',
            abstract: 'abstract',
            type: 'project_type_1',
            type2: 'project_type_2',
            status: 'project_state',
            startDate: 'start_date',
            endDate: 'end_date',
            instituteStartDate: 'iit_start_date',
            instituteEndDate: 'iit_end_date',
            budget: 'total budget',
            contribution: 'contribution',
            instituteBudget: 'iit_total_budget',
            instituteContribution: 'iit_total_contribution',
            instituteRole: 'project_role',
            partnersNumber: 'partners_count',
            url: 'project_url',
            internalUrl: 'moniit_url',
            partners: obj => mapObectsArray(obj.partners, partnersSchema),
            members: obj => mapObectsArray(obj.members, membersSchema),
            researchLines: obj => mapObectsArray(obj.lines, researchLinesSchema),
            logos: obj => mapObectsArray(obj.logos,
                {
                    name: 'name',
                    description: 'description',
                    image: 'logo'
                })
        }
    }

    await importCompetitiveProjects();
    await importIndustrialProjects();

    await projectAutoVerify();

    async function importCompetitiveProjects() {
        const type = ResearchItemTypes.PROJECT_COMPETITIVE;
        let projects
        const config = sails.config.scientilla.researchItems.external[type];
        const reqOptions = config.request;

        try {
            projects = await Utils.waitForSuccessfulRequest(reqOptions);
        } catch (e) {
            sails.log.debug(e);
            throw e;
        }

        const errors = [];
        let totalItems = 0, internalProjects = 0, created = 0, updated = 0;

        for (const project of projects) {
            totalItems++;

            if (project.project_type_2 === 'INTERNAL') {
                internalProjects++;
                continue;
            }

            try {
                const projectData = mapObject(project, schemas[type]);

                const code = projectData.code;
                if (!code) {
                    errors.push({
                        project: data.projectData.acronym,
                        message: 'Missing required field "code"'
                    });
                    continue;
                }

                const users = await User.find({username: projectData.members.map(m => m.email)});
                users.forEach(u => {
                    const member = projectData.members.find(m => m.email === u.username);
                    member.name = u.displayName ? u.displayName : u.name;
                    member.surname = u.displaySurname ? u.displaySurname : u.surname;
                });
                const sortedMembers = projectData.members.sort((a, b) => a.surname.localeCompare(b.surname))
                projectData.members = [
                    sortedMembers.find(m => m.role === 'pi'),
                    ...sortedMembers.filter(m => m.role === 'co_pi'),
                    ...sortedMembers.filter(m => m.role === 'member')
                ];

                if (!projectData.members[0]) {
                    errors.push({
                        project: {
                            acronym: projectData.acronym,
                            members: JSON.stringify(projectData.members)
                        },
                        message: 'Missing required field "pi"'
                    });
                    continue;
                }

                let startYear = null;
                let endYear = null;

                if (_.has(projectData, 'instituteStartDate') && typeof projectData.instituteStartDate === 'string') {
                    startYear = projectData.instituteStartDate.slice(0, projectData.instituteStartDate.indexOf('-'));
                }

                if (_.has(projectData, 'instituteEndDate') && typeof projectData.instituteEndDate === 'string') {
                    endYear = projectData.instituteEndDate.slice(0, projectData.instituteEndDate.indexOf('-'));
                }

                const pis = projectData.members.filter(member => ['pi', 'co_pi'].includes(member.role));

                const data = {
                    type: type,
                    startYear: startYear,
                    endYear: endYear,
                    authorsStr: await ResearchItem.generateAuthorsStr(pis),
                    projectData: projectData
                };

                const authorsData = pis.map((pi, pos) => ({
                    affiliations: pi.email.includes('@iit.it') ? [1] : [],
                    position: pos
                }));

                const prj = await Project.findOne({code: code, kind: ResearchItemKinds.EXTERNAL});
                if (!prj) {
                    await ResearchItem.createExternal(config.origin, code, data, authorsData);
                    created++;
                } else if (!_.isEqual(prj.projectData, data.projectData)) {
                    await ResearchItem.updateExternal(prj.id, data, authorsData);
                    updated++;
                }
            } catch (e) {
                sails.log.debug(project)
                errors.push(e);
            }
        }

        sails.log.info(`import ${type} completed`);
        sails.log.info(`${totalItems} found`);
        sails.log.info(`${internalProjects} internal projects`);
        sails.log.info(`external created: ${created}`);
        sails.log.info(`external updated: ${updated}`);
        sails.log.info(`errors: ${errors.length}`);
        errors.forEach(error => {
            if (error.researchItem)
                delete error.researchItem.logos;
            sails.log.debug(error);
            sails.log.debug('\n --------------------- \n');
        });
    }

    async function importIndustrialProjects() {
        const type = ResearchItemTypes.PROJECT_INDUSTRIAL;
        let projectsObj = {};
        let res;
        const errors = [];
        let totalItems = 0, skipped = 0, created = 0, updated = 0;
        const config = sails.config.scientilla.researchItems.external.project_industrial;
        const reqOptionsGroups = config.requestGroups;
        const reqOptionsUsers = config.requestUsers;

        const typeTranslation = {
            'Commerciale': 'Commercial',
            'Istituzionale': 'Institutional'
        };
        const categoryTranslation = {
            'Vendita': 'Sales',
            'Ricerca': 'Research',
            'Joint Lab': 'Joint Lab',
            'Servizio': 'Service',
            'Formazione': 'Educational',
            'Locazioni': 'Lease',
            'Inkind': 'Inkind'
        };

        try {
            res = await Utils.waitForSuccessfulRequest(reqOptionsGroups);
        } catch (e) {
            sails.log.debug(e);
            throw e;
        }
        const projectsByGroups = res.data;

        try {
            res = await Utils.waitForSuccessfulRequest(reqOptionsUsers);
        } catch (e) {
            sails.log.debug(e);
            throw e;
        }
        const projectsByUsers = res.data;

        const groups = await Group.find();
        const users = await User.find();

        //creating projects and adding groups
        for (const p of projectsByGroups) {
            if (p.project_category === 'Licenze/Opzioni') {
                skipped++;
                continue;
            }

            const group = groups.find(g => g.code === p.linea);

            const paymentLabel = _.camelCase(p.project_payment);

            const researchLine = {
                code: p.linea,
                description: group ? group.name : '',
                startDate: formatDate(p.startdate_normalizzata),
                endDate: formatDate(p.enddate_linea),
                [paymentLabel + 'Contribution']: p.contribution_obtained,
                [paymentLabel + 'AnnualContribution']: getAnnualContribution(p, 'annual_contribution_')
            };

            if (!projectsObj[p.codice_progetto]) {
                projectsObj[p.codice_progetto] = {
                    code: p.codice_progetto,
                    title: p.prj_title,
                    type: typeTranslation[p.project_type] ? typeTranslation[p.project_type] : p.project_type,
                    category: categoryTranslation[p.project_category] ? categoryTranslation[p.project_category] : p.project_category,
                    payment: p.project_payment,
                    startDate: formatDate(p.startdate_normalizzata),
                    endDate: formatDate(p.enddate),
                    researchLines: [
                        researchLine
                    ],
                    members: []
                };
            } else {
                const prj = projectsObj[p.codice_progetto];
                if (prj.payment !== p.project_payment)
                    prj.payment = 'inCash/inKind';
                const line = prj.researchLines.find(rl => rl.code === researchLine.code);
                if (!line) {
                    prj.researchLines.push(researchLine);
                } else {
                    line[paymentLabel + 'Contribution'] = (line[paymentLabel + 'Contribution'] || 0) + researchLine[paymentLabel + 'Contribution'];
                    line[paymentLabel + 'AnnualContribution'] = !Array.isArray(line[paymentLabel + 'AnnualContribution']) ?
                        researchLine[paymentLabel + 'AnnualContribution'] :
                        mergeAnnualContributions(line[paymentLabel + 'AnnualContribution'], researchLine[paymentLabel + 'AnnualContribution']);
                }
            }
        }

        //adding members
        for (const p of projectsByUsers) {
            if (p.project_category === 'Licenze/Opzioni') {
                skipped++;
                continue;
            }

            if (!projectsObj[p.codice_progetto]) {
                errors.push({
                    project: p.codice_progetto,
                    message: 'project not found in groups API'
                });
                continue;
            }

            const paymentLabel = _.camelCase(p.project_payment);
            const email = p.proposer.toLocaleLowerCase();

            let user = users.find(u => u.legacyEmail === email);
            if (!user) {
                const fullName = p.proposer.split('@')[0];
                user = {
                    displayName: fullName.split('.')[0],
                    displaySurname: fullName.split('.')[1]
                };
            }

            const member = {
                email: email,
                name: user.displayName,
                surname: user.displaySurname,
                [paymentLabel + 'Contribution']: p.contribution_obtained,
                [paymentLabel + 'AnnualContribution']: getAnnualContribution(p, 'annual_contribution_proposer_')
            };

            const prj = projectsObj[p.codice_progetto];
            const m = prj.members.find(m => m.email === member.email);
            if (!m) {
                prj.members.push(member);
            } else {
                m[paymentLabel + 'Contribution'] =  (m[paymentLabel + 'Contribution'] || 0) + member[paymentLabel + 'Contribution'];
                m[paymentLabel + 'AnnualContribution'] = !Array.isArray(m[paymentLabel + 'AnnualContribution']) ?
                    member[paymentLabel + 'AnnualContribution']
                    : mergeAnnualContributions(m[paymentLabel + 'AnnualContribution'], member[paymentLabel + 'AnnualContribution']);
            }
        }


        //creating researchItems
        const projects = Object.keys(projectsObj).map(k => projectsObj[k]);
        for (const projectData of projects) {
            totalItems++;
            try {
                const data = {
                    type: type,
                    startYear: projectData.startDate.slice(0, 4),
                    endYear: projectData.endDate.slice(0, 4),
                    authorsStr: await ResearchItem.generateAuthorsStr(projectData.members),
                    projectData: projectData
                };

                const authorsData = projectData.members.map((pi, pos) => ({
                    affiliations: pi.email.includes('@iit.it') ? [1] : [],
                    position: pos
                }));

                const prj = await Project.findOne({code: projectData.code, kind: ResearchItemKinds.EXTERNAL});
                if (!prj) {
                    await ResearchItem.createExternal(config.origin, projectData.code, data, authorsData);
                    created++;
                } else if (!_.isEqual(prj.projectData, data.projectData)) {
                    await ResearchItem.updateExternal(prj.id, data, authorsData);
                    updated++;
                }
            } catch (e) {
                errors.push(e);
            }
        }

        sails.log.info(`import of industrial projects completed`);
        sails.log.info(`${totalItems} found`);
        sails.log.info(`external created: ${created}`);
        sails.log.info(`external updated: ${updated}`);
        sails.log.info(`errors: ${errors.length}`);
        errors.forEach(error => {
            if (error.researchItem)
                delete error.researchItem.logos;
            sails.log.debug(error);
            sails.log.debug('\n --------------------- \n');
        });

        function formatDate(date) {
            if (!_.isString(date)) return;
            return date.replace(/\//g, '-').slice(0, 10);
        }

        function getAnnualContribution(p, key) {
            const annualContribution = [];
            for (let year = 2000; year < 2100; year++) {
                const contribution = p[key + year]
                if (contribution > 0)
                    annualContribution.push({
                        year,
                        contribution
                    });
            }
            return annualContribution;
        }

        /**
         * @param {Object[]} contr1
         * @param {Number} contr1[].year
         * @param {Number} contr1[].contribution
         * @param {Object[]} contr2
         * @param {Number} contr2[].year
         * @param {Number} contr2[].contribution
         */
        function mergeAnnualContributions(contr1, contr2) {
            return [...contr1, ...contr2]
                .sort((a, b) => a.year - b.year)
                .reduce((mergedContr, currContr) => {
                    const contr = mergedContr.find(cont => cont.year === currContr.year)
                    if (contr)
                        contr.contribution += currContr.contribution;
                    else
                        mergedContr.push(currContr);
                    return mergedContr;
                }, [])
        }
    }

    async function projectAutoVerify() {
        const errors = {other: 0};
        let verifiedCount = 0, unverifiedCount = 0;
        const externalProjects = await Project.find({kind: ResearchItemKinds.EXTERNAL});

        const institute = await Group.findOne({type: 'Institute'});
        for (const eProject of externalProjects) {
            const verifiedProject = await Project.findOne({
                kind: ResearchItemKinds.VERIFIED,
                code: eProject.code
            }).populate('verified');

            let verified = [];
            if (verifiedProject)
                verified = verifiedProject.verified.map(v => v.researchEntity);

            const lines = eProject.researchLines || [];
            const members = (eProject.members || []).filter(m => !m.role || ['pi', 'co_pi'].includes(m.role));

            //for some reason find({code:array}) doesn't work so i have to do this
            const groups = [];
            for (const code of lines.map(l => l.code)) {
                const foundGroup = await Group.findOne({code: code});
                if (!_.isEmpty(foundGroup))
                    groups.push(foundGroup);
            }
            const users = await User.find({legacy_email: members.map(m => m.email)});

            // only getting 1 level of parentGroups
            const parentGroups = await MembershipGroup.find({child_group: groups.map(g => g.id)})
                .populate('parent_group');

            const researchEntitiesId = [
                institute.id,
                ...users.map(u => u.researchEntity),
                ...groups.map(g => g.researchEntity),
                ...parentGroups.map(pg => pg.parent_group.researchEntity)
            ];

            const toVerify = _.difference(researchEntitiesId, verified);
            const toUnverify = _.difference(verified, researchEntitiesId);

            const res = await autoVerify(eProject, verifiedProject, toVerify, toUnverify);
            res.errors.forEach(e => setError(errors, e.message));
            unverifiedCount += res.unverifiedCount;
            verifiedCount += res.verifiedCount;

        }

        sails.log.info('Autoverify completed');
        sails.log.info(`added ${verifiedCount} new verifications`);
        sails.log.info(`removed ${unverifiedCount} old verifications`);
        sails.log.debug(`errors:`);
        sails.log.debug(errors);
    }
}

// import Patents

async function importPatents() {

    function patentDateFormat(date) {
        if (_.isEmpty(date) || date === 'null')
            return null;

        const arr = date.split('-');
        return [arr[2], arr[0], arr[1]].join('-');
    }

    function getAuthorsData(inventors) {
        const authorsData = [];
        inventors.forEach((inventor, position) => {
            const affiliations = [];
            if (inventor.email.includes('@iit'))
                affiliations.push(1);

            authorsData.push({
                position,
                affiliations
            });
        });

        return authorsData;
    }

    const patentSchema = {
        id: 'id',
        application: 'application',
        filingDate: obj => patentDateFormat(obj.filing_date),
        publication: 'publication',
        publicationDate: obj => patentDateFormat(obj.publication_date),
        patent: 'patent',
        title: 'title',
        note: 'note',
        issueDate: obj => patentDateFormat(obj.issue_date),
        abandonedExpiredAssignedDate: obj => patentDateFormat(obj.abandoned_expired_assigned_date),
        priorityPctExpirationDate: obj => patentDateFormat(obj.priority_pct_expiration_date),
        attorney: 'attorney',
        priority: 'priority',
        italian: 'italian',
        translation: obj => !!obj.statuses.find(s => s.code === '[T]'),
        statuses: obj => mapObectsArray(obj.statuses, {
            code: 'code',
            description: 'description',
            attachedAt: obj => patentDateFormat(obj.attached_at)
        }),
        inventors: obj => mapObectsArray(obj.inventors, {
            name: 'name',
            surname: 'surname',
            email: 'email',
            alias: 'alias',
            assignee: obj => mapObject(obj.assignee, {
                sign: 'sign',
                name: 'name'
            })
        }),
        researchLines: obj => mapObectsArray(obj.research_lines, {
            code: 'code',
            name: 'name'
        }),
        researchPrograms: obj => mapObectsArray(obj.research_program, {
            code: 'code',
            name: 'name'
        }),
        researchDomain: obj => mapObectsArray(obj.research_domain, {
            code: 'code',
            name: 'name'
        }),
        examiners: obj => mapObectsArray(obj.examiners, {
            name: 'name',
            surname: 'surname',
            office: 'office'
        }),
        assignees: obj => mapObectsArray(obj.assignees, {
            sign: 'sign',
            name: 'name'
        }),
        espacenetUrl: 'espacenet_url',
        patsnapUrl: 'patsnap_url'

    }
    const patentFamilySchema = {
        docket: 'docket',
        id: 'id',
        birthDate: obj => patentDateFormat(obj.birth_date),
        deathDate: obj => patentDateFormat(obj.death_date),
        knowledgeshareUrl: 'knowledgeshare_url',
        countries: 'countries'
    }

    let res
    const config = sails.config.scientilla.researchItems.external[ResearchItemTypes.PATENT];
    const reqOptions = config.request;

    try {
        res = await Utils.waitForSuccessfulRequest(reqOptions);
    } catch (e) {
        sails.log.debug(e);
        throw (e);
    }

    let importErrors = 0;
    let totalItems = 0, created = 0, updated = 0;

    for (const item of res.result) {
        if (!item.patent_family.docket) {
            importErrors++;
            sails.log.debug({
                success: false,
                researchItem: item,
                message: 'Missing required field "docket"'
            });
            continue;
        }

        for (const patent of item.patent_family.patents) {
            if (_.isEmpty(patent.statuses) || patent.statuses.find(s => s.code.toLocaleUpperCase() === '[NULL]'))
                continue;

            totalItems++;

            try {
                const authorsData = getAuthorsData(patent.inventors);
                const authorsStr = await ResearchItem.generateAuthorsStr(patent.inventors);

                const patentFamilyData = mapObject(item.patent_family, patentFamilySchema);
                const patentData = mapObject(patent, patentSchema);

                if (!patentData.application) {
                    importErrors++;
                    sails.log.debug({
                        success: false,
                        researchItem: patent,
                        message: 'Missing required field "application"'
                    });
                    continue;
                }

                const code = patentData.id;

                const data = {
                    type: ResearchItemTypes.PATENT,
                    authorsStr,
                    code,
                    patentFamilyData,
                    patentData,
                };

                const pat = await Patent.findOne({code: code, kind: ResearchItemKinds.EXTERNAL});
                if (!pat) {
                    await ResearchItem.createExternal(config.origin, code, data, authorsData);
                    created++;
                } else if (!_.isEqual(pat.patentFamilyData, data.patentFamilyData)
                    || !_.isEqual(pat.patentData, data.patentData)
                ) {
                    await ResearchItem.updateExternal(pat.id, data, authorsData);
                    updated++;
                }

            } catch (e) {
                importErrors++;
                sails.log.debug(e);
            }

        }
    }

    sails.log.info(`import ${ResearchItemTypes.PATENT} completed`);
    sails.log.info(`${totalItems} found`);
    sails.log.info(`external created: ${created}`);
    sails.log.info(`external updated: ${updated}`);
    sails.log.info(`errors: ${importErrors}`);


    const verificationErrors = {other: 0};
    let verifiedCount = 0, unverifiedCount = 0;
    const externalPatents = await Patent.find({kind: ResearchItemKinds.EXTERNAL});

    const institute = await Group.findOne({type: 'Institute'});
    for (const ePatent of externalPatents) {
        const verifiedPatent = await Patent.findOne({
            kind: ResearchItemKinds.VERIFIED,
            code: ePatent.code
        }).populate('verified');
        let verified = [];
        if (verifiedPatent)
            verified = verifiedPatent.verified.map(v => v.researchEntity);

        const lines = ePatent.patentData.researchLines || [];

        //for some reason find({code:array}) doesn't work so i have to do this
        const groups = [];
        for (const code of lines.map(l => l.code)) {
            const foundGroup = await Group.findOne({code: code});
            if (!_.isEmpty(foundGroup))
                groups.push(foundGroup);
        }

        // only getting 1 level of parentGroups
        const parentGroups = await MembershipGroup.find({child_group: groups.map(g => g.id)})
            .populate('parent_group');

        const users = await User.find({legacy_email: ePatent.patentData.inventors.map(m => m.email)});

        const researchEntitiesId = [
            institute.id,
            ...groups.map(g => g.researchEntity),
            ...users.map(u => u.researchEntity),
            ...parentGroups.map(pg => pg.parent_group.researchEntity)
        ];

        const toVerify = _.difference(researchEntitiesId, verified);
        const toUnverify = _.difference(verified, researchEntitiesId);

        const autoverifyRes = await autoVerify(ePatent, verifiedPatent, toVerify, toUnverify);
        autoverifyRes.errors.forEach(e => setError(verificationErrors, e.message));
        unverifiedCount += autoverifyRes.unverifiedCount;
        verifiedCount += autoverifyRes.verifiedCount;
    }

    sails.log.info('Autoverify completed');
    sails.log.info(`added ${verifiedCount} new verifications`);
    sails.log.info(`removed ${unverifiedCount} old verifications`);
    sails.log.debug(`errors:`);
    sails.log.debug(verificationErrors);

}

async function autoVerify(external, verified, ResearchEntityToVerify, researchEntityToUnverify) {
    const errors = [];
    let verifiedCount = 0, unverifiedCount = 0;
    for (const researchEntityId of _.uniq(ResearchEntityToVerify))
        try {
            await Verify.verify(external.id, researchEntityId);
            verifiedCount++;
        } catch (e) {
            errors.push(e);
        }

    for (const researchEntityId of _.uniq(researchEntityToUnverify))
        try {
            await Verify.unverify(researchEntityId, verified.id);
            unverifiedCount++;
        } catch (e) {
            errors.push(e);
        }

    return {
        errors,
        verifiedCount,
        unverifiedCount
    }
}


function mapObject(obj, schema) {
    return Object.keys(schema)
        .reduce((res, key) => {
            const mapKey = schema[key];

            if (_.isFunction(mapKey)) {
                res[key] = mapKey(obj);
                return res;
            }

            if (_.isNil(obj[mapKey]))
                return res;

            res[key] = obj[mapKey];
            return res;
        }, {});
}

function mapObectsArray(arr, schema) {
    if (!Array.isArray(arr))
        return [];
    return arr.map(e => mapObject(e, schema));
}

function setError(errors, message) {
    if (message)
        errors[message] = errors[message] + 1 || 1;
    else
        errors.other++;
}
