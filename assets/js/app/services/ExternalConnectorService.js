(function () {
    "use strict";
    angular.module("services")
        .factory("ExternalConnectorService", ExternalConnectorService);

    ExternalConnectorService.$inject = [
        'Restangular'
    ];

    function ExternalConnectorService(Restangular) {
        var service = {
            getConnectors: getConnectors,
            setConnectors: setConnectors,
        };

        /* jshint ignore:start */
        async function getConnectors() {
            return await Restangular.one('external-connectors').get().then(function(result) {
                return result.plain();
            });
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function setConnectors(connectors) {
            let formData = new FormData();
            formData.append('connectors', JSON.stringify(connectors));

            return await Restangular.one('external-connectors')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});
        }
        /* jshint ignore:end */

        return service;
    }
})();