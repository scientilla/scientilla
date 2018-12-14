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
            setConnector: setConnector,
        };

        /* jshint ignore:start */
        async function getConnectors() {
            return await Restangular.one('external-connectors').get().then(function(result) {
                return result.plain();
            });
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function setConnector(connector) {
            let formData = new FormData();
            formData.append('connector', JSON.stringify(connector));

            return await Restangular.one('external-connector')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});
        }
        /* jshint ignore:end */

        return service;
    }
})();