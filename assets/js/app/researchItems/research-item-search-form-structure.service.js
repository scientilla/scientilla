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
        'ResearchEntitiesService',
        'PeopleService',
        'ISO3166'
    ];

    function ResearchItemSearchFormStructureService(
        ResearchItemTypesService,
        documentSearchForm,
        groupTypes,
        groupTypeLabels,
        AuthService,
        ExternalConnectorService,
        Restangular,
        ResearchEntitiesService,
        PeopleService,
        ISO3166
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
            title: {
                inputType: 'text',
                label: 'Title',
                matchColumn: 'title',
                matchRule: 'contains',
                type: 'field',
                visibleFor: [allProjectTypes.value, projectTypeCompetitive, projectTypeIndustrial]
            },
            acronym: {
                inputType: 'text',
                label: 'Acronym',
                matchColumn: 'acronym',
                matchRule: 'contains',
                type: 'field',
                visibleFor: [allProjectTypes.value, projectTypeCompetitive, projectTypeIndustrial]
            },
            pi: {
                inputType: 'text',
                label: 'PI',
                matchColumn: 'piStr',
                matchRule: 'contains',
                type: 'field',
                visibleFor: [allProjectTypes.value, projectTypeCompetitive, projectTypeIndustrial]
            },
            year: {
                inputType: 'range',
                values: {},
                label: 'Start year',
                subLabel: '(range between)',
                matchColumn: 'startYear',
                rules: [
                    {
                        value: 'min',
                        rule: '>='
                    }, {
                        value: 'max',
                        rule: '<='
                    }
                ],
                type: 'field',
                dependingOn: 'projectType',
                visibleFor: [allProjectTypes.value, projectTypeCompetitive, projectTypeIndustrial]
            },
            status: {
                inputType: 'select',
                label: 'Status',
                matchColumn: 'status',
                values: [],
                type: 'field',
                visibleFor: [projectTypeCompetitive]
            },
            funding: {
                inputType: 'select',
                label: 'Funding type',
                matchColumn: 'project_type',
                values: [],
                type: 'field',
                visibleFor: [projectTypeCompetitive]
            },
            action: {
                inputType: 'select',
                label: 'Action type',
                matchColumn: 'project_type_2',
                values: [],
                type: 'field',
                visibleFor: [projectTypeCompetitive]
            },
            category: {
                inputType: 'select',
                label: 'Category',
                matchColumn: 'category',
                values: [],
                type: 'field',
                visibleFor: [projectTypeIndustrial]
            },
            payment: {
                inputType: 'select',
                label: 'Payment',
                matchColumn: 'payment',
                values: [],
                type: 'field',
                visibleFor: [projectTypeIndustrial]
            },
            projectType: {
                inputType: 'radio',
                label: 'Project Type',
                values: [],
                matchColumn: 'type',
                type: 'option',
                defaultValue: allProjectTypes.value,
                defaultValues: []
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

        const formStructures = {
            accomplishment: accomplishmentFormStructure,
            'accomplishment-suggested': accomplishmentFormStructure,
            'verified-accomplishment': accomplishmentFormStructure,
            project: projectFormStructure,
            'verified-project': projectFormStructure,
            patent: patentFormStructure,
            'verified-patent': patentFormStructure,
            'patent-family': patentFamilyFormStructure,
            'verified-patent-family': patentFamilyFormStructure,
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
                    type: 'action'
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
                    matchColumn: 'membership_groups',
                    matchRule: 'like',
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
                    matchRule: 'contains',
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
                active: {
                    inputType: 'checkbox',
                    label: 'Active employees',
                    matchColumn: 'active',
                    defaultValue: true,
                    type: 'action'
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
                subgroups: {
                    matchColumn: 'subgroups',
                    inputType: 'checkbox',
                    label: 'Include members of subgroups',
                    defaultValue: true,
                    type: 'action',
                    valueType: 'boolean'
                },
                former: {
                    matchColumn: 'former',
                    inputType: 'checkbox',
                    label: 'Include former members',
                    defaultValue: false,
                    type: 'action',
                    valueType: 'boolean'
                }
            }
        };

        return service;

        /* jshint ignore:start */

        async function setupProjectStructure(constant, researchEntity) {
            const projectTypes = _.concat(
                [{value: allProjectTypes.value, label: allProjectTypes.label}],
                await getResearchItemTypes('project', true)
            );
            formStructures[constant].projectType.values = projectTypes;
            formStructures[constant].status.values = await getProjectStatuses();
            formStructures[constant].payment.values = getProjectPayments();
            formStructures[constant].category.values = getProjectCategories();
            formStructures[constant].funding.values = getProjectFundings();
            formStructures[constant].action.values = getProjectActions();
            const defaultValues = await ResearchEntitiesService.getMinMaxYears(researchEntity, 'project');
            formStructures[constant].year.defaultValues = defaultValues;
            let yearValue = formStructures[constant].year.defaultValues.find(v => v.item_key === allProjectTypes.value);
            if (_.isNil(yearValue)) {
                yearValue = {
                    min: 2000,
                    max: new Date().getFullYear()
                };
            }
            formStructures[constant].year.values = {
                min: parseInt(yearValue.min),
                max: parseInt(yearValue.max)
            };
        }

        async function getStructure(constant, researchEntity = false) {

            let structure;

            switch (constant) {
                case 'accomplishment':
                    formStructures[constant].accomplishmentType.values = await getResearchItemTypes('accomplishment');
                    structure = formStructures[constant];
                    break;
                case 'accomplishment-suggested':
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
                case 'verified-accomplishment':
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
                case 'verified-project':
                    await setupProjectStructure(constant, researchEntity);
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
                case 'project':
                    await setupProjectStructure(constant, researchEntity);
                    structure = formStructures[constant];
                    break;
                case 'verified-patent':
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
                case 'patent':
                    structure = formStructures[constant];
                    break;
                case 'verified-patent-family':
                    structure = formStructures[constant];
                    break;
                case 'patent-family':
                    structure = formStructures[constant];
                    break;
                case 'document':
                    structure = documentSearchForm;
                    break;
                case 'external-document':
                    structure = Object.assign({},
                        {
                            connector: await getConnectorField()
                        },
                        documentSearchForm
                    );
                    break;
                case 'suggested-document':
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
                case 'verified-document':
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
                case 'group':
                    const user = AuthService.user;
                    formStructures[constant].type.values = [{
                        value: '?',
                        label: 'All'
                    }].concat(
                        Object.keys(groupTypes)
                            .map(k => ({label: groupTypeLabels[k], value: groupTypes[k]}))
                    );

                    formStructures[constant].code.ngIf = user.isAdmin();

                    structure = formStructures[constant];
                    break;
                case 'user':
                    formStructures[constant].gender.values = [{
                        value: '?',
                        label: 'All'
                    }, {
                        value: 'F',
                        label: 'Female'
                    }, {
                        value: 'M',
                        label: 'Male'
                    }];

                    formStructures[constant].ageRange.values = [{
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
                    formStructures[constant].roleCategory.values = [{
                        value: '?',
                        label: 'All'
                    }].concat(
                        Object.keys(roleCategories)
                            .map(k => ({label: roleCategories[k], value: roleCategories[k]}))
                    );

                    let nationalities = await PeopleService.getUniqueNationalities();
                    nationalities = nationalities.plain();
                    formStructures[constant].nationality.values = [{
                        value: '?',
                        label: 'All'
                    }].concat(
                        Object.keys(nationalities)
                            .map(k => ({label: ISO3166.getCountryName(nationalities[k]), value: nationalities[k]}))
                    );

                    structure = formStructures[constant];
                    break;
                case 'group-member':
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

        function getProjectActions() {
            const fundings = [];
            fundings.push({value: '?', label: 'Select'});

            for (const property in competitiveProjectActions) {
                fundings.push({value: property, label: competitiveProjectActions[property]});
            }

            return fundings;
        }
    }
})();