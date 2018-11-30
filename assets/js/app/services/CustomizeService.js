(function () {
    "use strict";
    angular.module("services")
        .factory("CustomizeService", CustomizeService);

    CustomizeService.$inject = [
        'Restangular'
    ];

    function CustomizeService(Restangular) {
        var service = {
            getCustomizations: getCustomizations,
            setCustomizations: setCustomizations
        };

        /* jshint ignore:start */
        async function getCustomizations() {
            return await Restangular.one('customize', 'institute').get();
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function setCustomizations(customizations) {
            var formData = new FormData();
            formData.append('institute', JSON.stringify(customizations.institute));
            formData.append('footer', JSON.stringify(customizations.footer));
            formData.append('logo', customizations.logo);
            return await Restangular.one('customize', 'institute')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});
        }
        /* jshint ignore:end */

        return service;
    }
})();