(function () {
    "use strict";
    angular.module("services")
        .factory("ExternalConnectorService", ExternalConnectorService);

    ExternalConnectorService.$inject = [
        'Restangular',
        'researchItemTypes'
    ];

    function ExternalConnectorService(Restangular, researchItemTypes) {
        let _connectors = null;
        return {
            getConnectors: getConnectors,
            setConnectors: setConnectors,
            searchAndImportEnabled: searchAndImportEnabled,
            resetConnectors: resetConnectors
        };

        /* jshint ignore:start */
        async function getConnectors() {
            if (!_connectors) {
                await refreshConnectors()
            }

            return _connectors;
        }

        async function setConnectors(connectors) {
            let formData = new FormData();
            formData.append('connectors', JSON.stringify(connectors));

            const res = await Restangular.one('external-connectors')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});
            _connectors = res.connectors;
            return res;
        }

        async function searchAndImportEnabled(category) {

            return await getConnectors().then((connectors) => {

                let tmpConnectors = angular.copy(connectors);
                let active = false;

                switch(category) {
                    case 'accomplishment':
                        break;
                    case 'document':
                        const excludedConnectors = ['publications'];
                        excludedConnectors.forEach(excludedConnector => {
                            delete tmpConnectors[excludedConnector];
                        });

                        Object.keys(tmpConnectors).forEach(function(connector) {
                            if (tmpConnectors[connector].active) {
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

        async function resetConnectors() {
            const formData = new FormData();
            const res = await Restangular.one('external-connectors', 'reset')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});
            _connectors = res.connectors;
            return res;
        }

        async function refreshConnectors() {
            _connectors = await Restangular.one('external-connectors').get().then(result => {
                return result.plain();
            });
        }
        /* jshint ignore:end */
    }
})();