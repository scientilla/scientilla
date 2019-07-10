(function () {

    angular.module("app")
        .factory("ResearchItemSearchFormStructureService", ResearchItemSearchFormStructureService);

    ResearchItemSearchFormStructureService.$inject = [
        'ResearchItemTypesService',
        'documentSearchForm',
        'groupTypes',
        'groupTypeLabels',
        'AuthService',
        'context'
    ];

    function ResearchItemSearchFormStructureService(ResearchItemTypesService, documentSearchForm, groupTypes, groupTypeLabels, AuthService, context) {

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
            maxYear: {
                inputType: 'year',
                label: 'Year from',
                matchColumn: 'year',
                matchRule: '>=',
                type: 'field'
            },
            minYear: {
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

        const formStructures = {
            accomplishment: accomplishmentFormStructure,
            'accomplishment-suggested': accomplishmentFormStructure,
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
                    label: 'Active',
                    matchColumn: 'active',
                    defaultValue: true,
                    type: 'action'
                }
            },
            user: {
                name: {
                    inputType: 'text',
                    label: 'Name',
                    matchColumn: 'name',
                    matchRule: 'contains',
                    type: 'field'
                },
                surname: {
                    inputType: 'text',
                    label: 'Surname',
                    matchColumn: 'surname',
                    matchRule: 'contains',
                    type: 'field'
                }
            }
        };

        return service;

        /* jshint ignore:start */
        async function getStructure(constant) {

            let structure, accomplishmentTypes;

            switch (constant) {
                case 'accomplishment':
                    accomplishmentTypes = await ResearchItemTypesService.getTypes('accomplishment');

                    formStructures[constant].accomplishmentType.values = _.concat(
                        [{value: "?", label: 'Select'}],
                        accomplishmentTypes.map(s => ({value: s.key, label: s.label}))
                    );

                    structure = formStructures[constant];
                    break;
                case 'accomplishment-suggested':
                    accomplishmentTypes = await ResearchItemTypesService.getTypes('accomplishment');

                    formStructures[constant].accomplishmentType.values = _.concat(
                        [{value: "?", label: 'Select'}],
                        accomplishmentTypes.map(s => ({value: s.key, label: s.label}))
                    );

                    structure = Object.assign({},
                        formStructures[constant],
                        {
                            discarded: {
                                inputType: 'checkbox',
                                label: 'Show discarded accomplishments',
                                defaultValue: false,
                                matchColumn: 'discarded',
                                type: 'action'
                            }
                        });
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
                            rejected: {
                                inputType: 'checkbox',
                                label: 'Show discarded documents',
                                defaultValue: false,
                                matchColumn: 'discarded',
                                type: 'action'
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
                    structure = formStructures[constant];
                    break;
                default:
                    break;
            }

            return structure;
        }

        async function getConnectorField() {
            const researchEntity = await context.getSubResearchEntity();
            const connectors = researchEntity.getExternalConnectors();
            const values = connectors.map(c => ({value: c.value, label: c.label}));

            return {
                inputType: 'select',
                label: 'Connector',
                values: values,
                matchColumn: 'origin',
                defaultValue: 'scopus',
                type: 'connector'
            };
        }

        /* jshint ignore:end */
    }
})();