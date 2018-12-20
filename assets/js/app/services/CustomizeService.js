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
            setCustomizations: setCustomizations,
            resetCustomizations: resetCustomizations
        };

        /* jshint ignore:start */
        async function getCustomizations() {
            return await Restangular.one('customize').get();
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function setCustomizations(customizations) {
            var formData = new FormData();
            formData.append('institute', JSON.stringify(customizations.institute));
            formData.append('footer', JSON.stringify(customizations.footer));
            if (customizations.logos && customizations.logos.header && customizations.logos.header.file) {
                formData.append('headerLogo', customizations.logos.header.file);
            }
            if (customizations.logos && customizations.logos.institute && customizations.logos.institute.file) {
                formData.append('instituteIcon', customizations.logos.institute.file);
            }
            formData.append('styles', JSON.stringify(customizations.styles));
            return await Restangular.one('customize')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function resetCustomizations() {
            var formData = new FormData();
            return await Restangular.one('customize', 'reset')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});
        }
        /* jshint ignore:end */

        return service;
    }
})();