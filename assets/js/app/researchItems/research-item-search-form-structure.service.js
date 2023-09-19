(function () {

    angular.module("app")
        .factory("ResearchItemSearchFormStructureService", ResearchItemSearchFormStructureService);

    ResearchItemSearchFormStructureService.$inject = [
        'ResearchItemTypesService',
        'documentSearchForm',
        'groupTypes',
        'groupTypeLabels',
        'AuthService',
        'ExternalConnectorService',
        'Restangular',
        'PeopleService',
        'ProjectService',
        'ISO3166',
        'agreementTypes'
    ];

    function ResearchItemSearchFormStructureService(
        ResearchItemTypesService,
        documentSearchForm,
        groupTypes,
        groupTypeLabels,
        AuthService,
        ExternalConnectorService,
        Restangular,
        PeopleService,
        ProjectService,
        ISO3166,
        agreementTypes
    ) {

        const service = {
            getStructure
        };

        const accomplishmentFormStructure = {
            title: {
                inputType: 'text',
                label: 'Title',
                matchColumn: 'title',
                matchRule: 'contains',
                type: 'field'
            },
            author: {
                inputType: 'text',
                label: 'Author',
                matchColumn: 'authorsStr',
                matchRule: 'contains',
                type: 'field'
            },
            minYear: {
                inputType: 'year',
                label: 'Year from',
                matchColumn: 'year',
                matchRule: '>=',
                type: 'field'
            },
            maxYear: {
                inputType: 'year',
                label: 'Year to',
                matchColumn: 'year',
                matchRule: '<=',
                type: 'field'
            },
            accomplishmentType: {
                inputType: 'select',
                label: 'Accomplishment Type',
                values: [],
                matchColumn: 'type',
                type: 'field'
            }
        };

        const projectFormStructure = {
            projectType: {
                inputType: 'select',
                label: 'Project Type',
                values: [],
                matchColumn: 'type',
                type: 'field',
                defaultValue: allProjectTypes.value,
                defaultValues: []
            },
            title: {
                inputType: 'text',
                label: 'Title',
                matchColumn: 'title',
                matchRule: 'contains',
                type: 'field'
            },
            acronym: {
                inputType: 'text',
                label: 'Acronym',
                matchColumn: 'acronym',
                matchRule: 'contains',
                type: 'field'
            },
            pi: {
                inputType: 'text',
                label: 'PI',
                matchColumn: 'authorsStr',
                matchRule: 'contains',
                type: 'field'
            },
            proposer: {
                inputType: 'text',
                label: 'Proposer',
                matchColumn: 'authorsStr',
                matchRule: 'contains',
                type: 'field'
            },
            minYear: {
                inputType: 'year',
                label: 'Year from',
                matchColumn: 'startYear',
                matchRule: '>=',
                type: 'field'
            },
            maxYear: {
                inputType: 'year',
                label: 'Year to',
                matchColumn: 'startYear',
                matchRule: '<=',
                type: 'field'
            },
            status: {
                inputType: 'select',
                label: 'Status',
                matchColumn: 'status',
                values: [],
                type: 'field'
            },
            funding: {
                inputType: 'select',
                label: 'Funding type',
                matchColumn: 'project_type',
                values: [],
                type: 'field'
            },
            action: {
                inputType: 'multiple-checkbox',
                label: 'Action type',
                matchColumn: 'project_type_2',
                values: [],
                type: 'field'
            },
            category: {
                inputType: 'select',
                label: 'Category',
                matchColumn: 'category',
                values: [],
                type: 'field'
            },
            payment: {
                inputType: 'select',
                label: 'Payment',
                matchColumn: 'payment',
                values: [],
                type: 'field'
            }
        };

        const patentFormStructure = {
            title: {
                inputType: 'text',
                label: 'Title',
                matchColumn: 'title',
                matchRule: 'contains',
                type: 'field'
            },
            author: {
                inputType: 'text',
                label: 'Inventor',
                matchColumn: 'authorsStr',
                matchRule: 'contains',
                type: 'field'
            },
            docket: {
                inputType: 'text',
                label: 'Docket',
                matchColumn: 'familyDocket',
                matchRule: 'contains',
                type: 'field'
            },
            application: {
                inputType: 'text',
                label: 'Application',
                matchColumn: 'application',
                matchRule: 'contains',
                type: 'field'
            },
            type: {
                inputType: 'select',
                label: 'Application Type',
                values: [],
                matchColumn: 'type',
                type: 'field',
                listenForChange: true,
                defaultValue: 'all',
                defaultValues: []
            },
            minYear: {
                inputType: 'year',
                label: 'Year from',
                matchColumn: 'year',
                matchRule: '>=',
                type: 'field'
            },
            maxYear: {
                inputType: 'year',
                label: 'Year to',
                matchColumn: 'year',
                matchRule: '<=',
                type: 'field'
            },
            translation: {
                inputType: 'checkbox',
                label: 'Show also Translation applications',
                defaultValue: false,
                matchColumn: 'translation',
                type: 'action',
                valueType: 'boolean',
            }
        };

        const patentFamilyFormStructure = {
            title: {
                inputType: 'text',
                label: 'Dock',
                matchColumn: 'dock',
                matchRule: 'contains',
                type: 'field'
            }
        };

        const agreementFormStructure = {
            acronym: {
                inputType: 'text',
                label: 'Acronym',
                matchColumn: 'acronym',
                matchRule: 'contains',
                type: 'field',
            },
            title: {
                inputType: 'text',
                label: 'Title',
                matchColumn: 'title',
                matchRule: 'contains',
                type: 'field',
            },
            agreementType: {
                inputType: 'select',
                label: 'Type',
                matchColumn: 'projectType',
                matchRule: 'contains',
                type: 'field',
            },
            scientificCoordinator: {
                inputType: 'text',
                label: 'Scientific coordinator',
                matchColumn: 'authorsStr',
                matchRule: 'contains',
                type: 'field',
            },
            minYear: {
                inputType: 'year',
                label: 'Year from',
                matchColumn: 'startYear',
                matchRule: '>=',
                type: 'field'
            },
            maxYear: {
                inputType: 'year',
                label: 'Year to',
                matchColumn: 'startYear',
                matchRule: '<=',
                type: 'field'
            }
        };

        const agreementGroupFormStructure = {
            title: {
                inputType: 'text',
                label: 'Title',
                matchColumn: 'title',
                matchRule: 'contains',
                type: 'field',
            }
        };

        const trainingModuleFormStructure = {
            title: {
                inputType: 'text',
                label: 'Title',
                matchColumn: 'title',
                matchRule: 'contains',
                type: 'field',
            },
            authorStr: {
                inputType: 'text',
                label: 'Lecturer(s)',
                matchColumn: 'authorsStr',
                matchRule: 'contains',
                type: 'field',
            },
            year: {
                inputType: 'text',
                label: 'Academic year',
                subLabel: '(start year with format YYYY)',
                matchColumn: 'year',
                matchRule: 'contains',
                type: 'field',
            },
            trainingModuleType: {
                inputType: 'select',
                label: 'Training Module Type',
                values: [],
                matchColumn: 'type',
                type: 'field'
            }
        };

        const formStructures = {
            accomplishment: accomplishmentFormStructure,
            'accomplishment-suggested': accomplishmentFormStructure,
            'verified-accomplishment': accomplishmentFormStructure,
            project: projectFormStructure,
            'project-suggested': projectFormStructure,
            'verified-project': projectFormStructure,
            patent: patentFormStructure,
            'patent-suggested': patentFormStructure,
            'verified-patent': patentFormStructure,
            'patent-family': patentFamilyFormStructure,
            'verified-patent-family': patentFamilyFormStructure,
            agreement: agreementFormStructure,
            'verified-agreement': agreementFormStructure,
            'agreement-group': agreementGroupFormStructure,
            group: {
                name: {
                    inputType: 'text',
                    label: 'Name',
                    matchColumn: 'name',
                    matchRule: 'contains',
                    type: 'field'
                },
                type: {
                    inputType: 'select',
                    label: 'Type',
                    matchColumn: 'type',
                    values: [],
                    type: 'field'
                },
                code: {
                    inputType: 'text',
                    label: 'CDR/CODE',
                    matchColumn: 'code',
                    matchRule: 'contains',
                    ngIf: false,
                    type: 'field'
                },
                active: {
                    inputType: 'checkbox',
                    label: 'Active groups',
                    matchColumn: 'active',
                    defaultValue: true,
                    type: 'action',
                    valueType: 'boolean'
                }
            },
            user: {
                name: {
                    inputType: 'text',
                    label: 'Name',
                    match: [
                        {
                            column: 'name',
                            rule: 'contains',
                        }, {
                            column: 'display_name',
                            rule: 'contains',
                        }
                    ],
                    type: 'field'
                },
                surname: {
                    inputType: 'text',
                    label: 'Surname',
                    match: [
                        {
                            column: 'surname',
                            rule: 'contains',
                        }, {
                            column: 'display_surname',
                            rule: 'contains',
                        }
                    ],
                    type: 'field'
                },
                group: {
                    inputType: 'autocomplete-group',
                    label: 'Group',
                    matchColumn: 'group',
                    type: 'field'
                },
                nationality: {
                    inputType: 'select',
                    label: 'Country of origin',
                    matchColumn: 'nationality',
                    type: 'field'
                },
                roleCategory: {
                    inputType: 'select',
                    label: 'Role category',
                    matchColumn: 'roleCategory',
                    type: 'field'
                },
                gender: {
                    inputType: 'select',
                    label: 'Gender',
                    matchColumn: 'gender',
                    type: 'field'
                },
                ageRange: {
                    inputType: 'select',
                    label: 'Age range',
                    matchColumn: 'ageRange',
                    type: 'field'
                },
                formerEmployees: {
                    matchColumn: 'formerEmployees',
                    inputType: 'checkbox',
                    label: 'Show former employees',
                    defaultValue: false,
                    type: 'action',
                    valueType: 'boolean'
                }
            },
            'group-member': {
                name: {
                    inputType: 'text',
                    label: 'Name',
                    match: [
                        {
                            column: 'name',
                            rule: 'contains',
                        }, {
                            column: 'display_name',
                            rule: 'contains',
                        }
                    ],
                    type: 'field'
                },
                surname: {
                    inputType: 'text',
                    label: 'Surname',
                    match: [
                        {
                            column: 'surname',
                            rule: 'contains',
                        }, {
                            column: 'display_surname',
                            rule: 'contains',
                        }
                    ],
                    type: 'field'
                },
                nationality: {
                    inputType: 'select',
                    label: 'Country of origin',
                    matchColumn: 'nationality',
                    type: 'field'
                },
                roleCategory: {
                    inputType: 'select',
                    label: 'Role category',
                    matchColumn: 'roleCategory',
                    type: 'field'
                },
                gender: {
                    inputType: 'select',
                    label: 'Gender',
                    matchColumn: 'gender',
                    type: 'field'
                },
                ageRange: {
                    inputType: 'select',
                    label: 'Age range',
                    matchColumn: 'ageRange',
                    type: 'field'
                },
                subgroups: {
                    matchColumn: 'subgroups',
                    inputType: 'checkbox',
                    label: 'Show members of subgroups',
                    defaultValue: true,
                    type: 'action',
                    valueType: 'boolean'
                },
                formerMembers: {
                    matchColumn: 'formerMembers',
                    inputType: 'checkbox',
                    label: 'Show former group members',
                    defaultValue: false,
                    type: 'action',
                    valueType: 'boolean'
                }
            },
            'training-module-suggested': trainingModuleFormStructure,
            'training-module-verified': trainingModuleFormStructure,
            'training-module-draft': trainingModuleFormStructure,
            'training-module': trainingModuleFormStructure,
        };

        return service;

        /* jshint ignore:start */

        async function setupProjectStructure(constant) {
            const projectTypes = _.concat(
                [{value: allProjectTypes.value, label: allProjectTypes.label}],
                await getResearchItemTypes('project', true)
            ).filter(type => type.value !== 'project_agreement');

            // Show only competitive projects
            formStructures[constant].projectType.values = projectTypes;
            formStructures[constant].status.values = await getProjectStatuses();
            formStructures[constant].payment.values = getProjectPayments();
            formStructures[constant].category.values = getProjectCategories();
            formStructures[constant].funding.values = getProjectFundings();
            formStructures[constant].action.values = await getProjectActions();
        }

        async function setupAgreementStructure(constant) {
            formStructures[constant].agreementType.values = getAgreementTypes();
        }

        async function setupPatentStructure(constant) {
            formStructures[constant].type.values = [
                {value: 'all', label: 'All'},
                {value: 'priorities', label: 'Priorities'},
                {value: 'prosecutions', label: 'Prosecutions'}
            ];
        }

        async function getStructure(constant, researchEntity = false) {

            let structure;

            switch (true) {
                case constant === 'accomplishment':
                    formStructures[constant].accomplishmentType.values = await getResearchItemTypes('accomplishment');
                    structure = formStructures[constant];
                    break;
                case constant === 'accomplishment-suggested':
                    formStructures[constant].accomplishmentType.values = await getResearchItemTypes('accomplishment');

                    structure = Object.assign({},
                        formStructures[constant],
                        {
                            discarded: {
                                inputType: 'checkbox',
                                label: 'Show discarded accomplishments',
                                defaultValue: false,
                                matchColumn: 'discarded',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        });
                    break;
                case constant === 'verified-accomplishment':
                    formStructures[constant].accomplishmentType.values = await getResearchItemTypes('accomplishment');

                    structure = Object.assign({},
                        formStructures[constant],
                        {
                            favorites: {
                                inputType: 'checkbox',
                                label: 'Show only favorite accomplishments',
                                defaultValue: false,
                                matchColumn: 'favorites',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        });
                    break;
                case constant === 'verified-project':
                    await setupProjectStructure(constant, researchEntity, 'verified');
                    structure = Object.assign(
                        {},
                        formStructures[constant],
                        {
                            favorites: {
                                inputType: 'checkbox',
                                label: 'Show only favorite projects',
                                defaultValue: false,
                                matchColumn: 'favorites',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        }
                    );
                    break;
                case constant === 'project':
                    await setupProjectStructure(constant, researchEntity, 'verified');
                    structure = formStructures[constant];
                    break;
                case constant === 'project-suggested':
                    await setupProjectStructure(constant, researchEntity, 'suggested');
                    structure = Object.assign({},
                        formStructures[constant],
                        {
                            discarded: {
                                inputType: 'checkbox',
                                label: 'Show discarded projects',
                                defaultValue: false,
                                matchColumn: 'discarded',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        });
                    break;
                case constant === 'verified-patent':
                    await setupPatentStructure(constant, researchEntity, 'verified');
                    structure = Object.assign(
                        {},
                        formStructures[constant],
                        {
                            favorites: {
                                inputType: 'checkbox',
                                label: 'Show only favorite applications',
                                defaultValue: false,
                                matchColumn: 'favorites',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        }
                    );
                    break;
                case constant === 'patent':
                    await setupPatentStructure(constant, researchEntity, 'verified');
                    structure = formStructures[constant];
                    break;
                case constant === 'patent-suggested':
                    await setupPatentStructure(constant, researchEntity, 'suggested');
                    structure = Object.assign({},
                        formStructures[constant],
                        {
                            discarded: {
                                inputType: 'checkbox',
                                label: 'Show discarded patents',
                                defaultValue: false,
                                matchColumn: 'discarded',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        });
                    break;
                case constant === 'verified-patent-family':
                    structure = formStructures[constant];
                    break;
                case constant === 'patent-family':
                    structure = formStructures[constant];
                    break;
                case constant === 'verified-agreement':
                    await setupAgreementStructure(constant, researchEntity, 'verified_agreements');
                    structure =  formStructures[constant];
                    break;
                case constant === 'agreement':
                    await setupAgreementStructure(constant, researchEntity, 'draft_agreements');
                    structure = formStructures[constant];
                    break;
                case constant === 'agreement-group':
                    structure = formStructures[constant];
                    break;
                case constant === 'document':
                    structure = documentSearchForm;
                    break;
                case constant === 'external-document':
                    structure = Object.assign({},
                        {
                            connector: await getConnectorField()
                        },
                        documentSearchForm
                    );
                    break;
                case constant === 'suggested-document':
                    structure = Object.assign({},
                        documentSearchForm,
                        {
                            discarded: {
                                inputType: 'checkbox',
                                label: 'Show discarded documents',
                                defaultValue: false,
                                matchColumn: 'discarded',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        }
                    );
                    break;
                case constant === 'verified-document':
                    structure = Object.assign({},
                        documentSearchForm,
                        {
                            favorites: {
                                inputType: 'checkbox',
                                label: 'Show only favorite documents',
                                defaultValue: false,
                                matchColumn: 'favorites',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        }
                    );
                    break;
                case constant === 'group':
                    const user = AuthService.user;
                    const types = _.cloneDeep(groupTypes);
                    delete types.PROJECT;

                    formStructures[constant].type.values = [{
                        value: '?',
                        label: 'All'
                    }].concat(
                        Object.keys(types)
                            .map(k => ({label: groupTypeLabels[k], value: types[k]}))
                    );

                    formStructures[constant].code.ngIf = user.isAdmin();

                    structure = formStructures[constant];
                    break;
                case constant === 'user' || constant === 'group-member':
                    structure = angular.copy(formStructures[constant]);

                    if (!AuthService.user.isSuperViewer()) {
                        delete structure.gender;
                    } else {
                        structure.gender.values = [{
                            value: '?',
                            label: 'All'
                        }, {
                            value: 'F',
                            label: 'Female'
                        }, {
                            value: 'M',
                            label: 'Male'
                        }];
                    }

                    structure.ageRange.values = [{
                        value: '?',
                        label: 'All'
                    }, {
                        value: '<25',
                        label: '<25'
                    }, {
                        value: '25-29',
                        label: '25-29'
                    }, {
                        value: '30-34',
                        label: '30-34'
                    }, {
                        value: '35-44',
                        label: '35-44'
                    }, {
                        value: '45-54',
                        label: '45-54'
                    }, {
                        value: '>=55',
                        label: '>=55'
                    }];

                    let roleCategories = await PeopleService.getUniqueRoleCategories();
                    roleCategories = roleCategories.plain();
                    structure.roleCategory.values = [{
                        value: '?',
                        label: 'All'
                    }].concat(
                        Object.keys(roleCategories)
                            .map(k => ({label: roleCategories[k], value: roleCategories[k]}))
                    );

                    let nationalities = await PeopleService.getUniqueNationalities();
                    nationalities = nationalities.plain();
                    nationalities = Object.keys(nationalities)
                        .map(k => ({ label: ISO3166.getCountryName(nationalities[k]), value: nationalities[k]}));

                    nationalities = _.sortBy(nationalities, 'label');
                    nationalities.unshift({
                        value: '?',
                        label: 'All'
                    });

                    structure.nationality.values = nationalities;
                    break;
                case constant === 'training-module':
                    formStructures[constant].trainingModuleType.values = await getResearchItemTypes('training_module');
                    structure = formStructures[constant];
                    break;
                case constant === 'training-module-suggested':
                    formStructures[constant].trainingModuleType.values = await getResearchItemTypes('training_module');
                    structure = Object.assign({},
                        formStructures[constant],
                        {
                            discarded: {
                                inputType: 'checkbox',
                                label: 'Show discarded training modules',
                                defaultValue: false,
                                matchColumn: 'discarded',
                                type: 'action',
                                valueType: 'boolean'
                            }
                        }
                    );
                    break;
                case constant === 'training-module-verified':
                    formStructures[constant].trainingModuleType.values = await getResearchItemTypes('training_module');
                    structure = formStructures[constant];
                    break;
                case constant === 'training-module-draft':
                    formStructures[constant].trainingModuleType.values = await getResearchItemTypes('training_module');
                    structure = formStructures[constant];
                    break;
                case constant === 'training-module-group':
                    formStructures[constant].trainingModuleType.values = await getResearchItemTypes('training_module');
                    structure = formStructures[constant];
                    break;
                default:
                    break;
            }

            return structure;
        }

        async function getConnectorField() {
            let externalConnectors = [],
                defaultValue = '';

            await ExternalConnectorService.getConnectors().then((connectors) => {
                if (connectors && connectors.publications && connectors.publications.active) {
                    externalConnectors.push({value: 'publications', label: 'Publications'});
                }

                if (connectors && connectors.elsevier && connectors.elsevier.active) {
                    externalConnectors.push({value: 'scopus', label: 'Scopus'});
                    defaultValue = 'scopus';
                } else {
                    if (externalConnectors.length > 0) {
                        defaultValue = externalConnectors[0].value;
                    }
                }
            });

            return {
                inputType: 'select',
                label: 'Connector',
                values: externalConnectors,
                matchColumn: 'origin',
                defaultValue: defaultValue,
                type: 'connector'
            };
        }

        async function getResearchItemTypes(filterType, skipSelect = false) {
            const researchItemTypes = await ResearchItemTypesService.getTypes(filterType);

            if (skipSelect) {
                return researchItemTypes.map(s => ({value: s.key, label: s.label}));
            }

            return _.concat(
                [{value: "?", label: 'Select'}],
                researchItemTypes.map(s => ({value: s.key, label: s.label}))
            );
        }

        async function getProjectStatuses() {
            let statuses = await Restangular.all('projectstatuses').getList();
            return _.concat(
                [{value: "?", label: 'Select'}],
                statuses.map(s => ({value: s.status, label: projectStatuses[s.status]}))
            );
        }
        /* jshint ignore:end */

        function getProjectPayments() {
            const payments = [];
            payments.push({value: '?', label: 'Select'});

            for (const property in industrialProjectPayments) {
                payments.push({value: property, label: industrialProjectPayments[property]});
            }

            return payments;
        }

        function getProjectCategories() {
            const categories = [];
            categories.push({value: '?', label: 'Select'});

            for (const property in industrialProjectCategories) {
                categories.push({value: property, label: industrialProjectCategories[property]});
            }

            return categories;
        }

        function getProjectFundings() {
            const fundings = [];
            fundings.push({value: '?', label: 'Select'});

            for (const property in competitiveProjectFundings) {
                fundings.push({value: property, label: competitiveProjectFundings[property]});
            }

            return fundings;
        }

        /* jshint ignore:start */
        async function getProjectActions() {
            return await ProjectService.getActions();
        }
        /* jshint ignore:end */

        function getAgreementTypes() {
            const types = [];
            types.push({value: '?', label: 'Select'});

            for (const type of agreementTypes) {
                types.push({value: type.key, label: type.label});
            }

            return types;
        }
    }
})();
