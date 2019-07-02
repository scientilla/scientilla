(function () {
    "use strict";
    angular.module("services")
        .factory("ExternalConnectorService", ExternalConnectorService);

    ExternalConnectorService.$inject = [
        'Restangular',
        'researchItemTypes'
    ];

    function ExternalConnectorService(Restangular, researchItemTypes) {
        var service = {
            getConnectors: getConnectors,
            setConnectors: setConnectors,
            searchAndImportEnabled: searchAndImportEnabled
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

        /* jshint ignore:start */
        async function searchAndImportEnabled(category) {

            return await getConnectors().then((connectors) => {

                let active = false;

                switch(category) {
                    case 'accomplishment':
                        break;
                    case 'document':
                        const excludedConnectors = ['publications'];
                        excludedConnectors.forEach(excludedConnector => {
                            delete connectors[excludedConnector];
                        });

                        Object.keys(connectors).forEach(function(connector) {
                            if (connectors[connector].active) {
                                active = true;
                            }
                        });
                        break;
                    default:
                        break;
                }

                return active;
            });
        }
        /* jshint ignore:end */

        return service;
    }
})();