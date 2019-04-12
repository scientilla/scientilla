(function () {

    angular.module("app")
        .factory("ResearchItemTypesService", ResearchItemTypesService);

    // Inject the source types & types into the service from scientilla.constants.js
    ResearchItemTypesService.$inject = ['Restangular'];

    function ResearchItemTypesService(Restangular) {

        let researchItemTypes;

        // Define the public functions of this service
        const service = {
            getTypes,
            getTypeEnum,
            getTypeLabel
        };

        return service;

        /* jshint ignore:start */
        async function getTypes(filterType) {
            if (!researchItemTypes)
                researchItemTypes = await Restangular.all('researchitemtypes').getList();

            return researchItemTypes.filter(rit => filterType ? rit.type === filterType : true);
        }

        async function getTypeEnum(filterType) {
            const researchItemTypes = await getTypes(filterType);
            const typesEnum = {};
            researchItemTypes.forEach(rit => typesEnum[rit.key] = rit);
            return typesEnum;
        }

        async function getTypeLabel(accomplishmentTypeKey) {
            const researchItemTypes = await getTypes();
            const rit = researchItemTypes.find(rit => rit.key === accomplishmentTypeKey);
            return rit ? rit.label : undefined;
        }

        /* jshint ignore:end */
    }
})();