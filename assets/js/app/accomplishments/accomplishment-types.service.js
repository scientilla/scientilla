(function () {

    angular.module("accomplishments")
        .factory("AccomplishmentTypesService", AccomplishmentTypesService);

    // Inject the source types & types into the service from scientilla.constants.js
    AccomplishmentTypesService.$inject = [
        'accomplishmentSourceTypes',
        'accomplishmentTypes'
    ];

    function AccomplishmentTypesService(accomplishmentSourceTypes, accomplishmentTypes) {

        // Define the public functions of this service
        const service = {
            getTypes: getTypes,
            getTypeLabel: getTypeLabel,
            getSourceTypes: getSourceTypes,
            getSourceTypeLabel: getSourceTypeLabel
        };

        return service;

        // This function returns the source types
        function getSourceTypes() {
            return accomplishmentSourceTypes;
        }

        // This function returns the types
        function getTypes() {
            return accomplishmentTypes;
        }

        // This function returns the label of the given type
        function getTypeLabel(accomplishmentTypeKey) {
            const accomplishmentTypes = getTypes();
            return _.find(accomplishmentTypes, {key: accomplishmentTypeKey}).label;
        }

        // This function returns the label of the given source type
        function getSourceTypeLabel(sourceTypeKey) {
            const sourceTypes = getSourceTypes();
            return _.find(sourceTypes, {id: sourceTypeKey}).label;
        }
    }
})();