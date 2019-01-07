(function () {

    angular.module("documents").factory("AccomplishmentTypesService", AccomplishmentTypesService);

    AccomplishmentTypesService.$inject = [
        'accomplishmentTypes'
    ];

    function AccomplishmentTypesService(accomplishmentTypes) {

        const service = {
            getAccomplishmentFields: getAccomplishmentFields,
            getAccomplishmentTypes: getAccomplishmentTypes,
            getAccomplishmentTypeLabel: getAccomplishmentTypeLabel
        };

        return service;

        function getAccomplishmentFields() {
            let fields;

            fields = {
                title: {
                    inputType: 'text'
                },
                authorsStr: {
                    inputType: 'text',
                    label: "Authors",
                },
                year: {
                    inputType: 'text'
                },
                journal: {
                    inputType: 'text'
                },
                volume: {
                    inputType: 'text'
                },
                issue: {
                    inputType: 'text'
                },
                pages: {
                    inputType: 'text'
                },
                articleNumber: {
                    label: "Article number",
                    inputType: 'text'
                },
                doi: {
                    label: "DOI",
                    inputType: 'text'
                },
                abstract: {
                    inputType: 'text',
                    multiline: true
                },
                scopusId: {
                    label: "Scopus ID",
                    inputType: 'text'
                },
                wosId: {
                    label: "WOS ID",
                    inputType: 'text'
                }
            };

            return fields;
        }

        function getAccomplishmentTypes() {
            return accomplishmentTypes;
        }

        function getAccomplishmentTypeLabel(accomplishmentTypeKey) {
            const accomplishmentTypes = getAccomplishmentTypes();
            return _.find(accomplishmentTypes, {key: accomplishmentTypeKey}).label;
        }
    }
})();