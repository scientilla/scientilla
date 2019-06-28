(function () {
    "use strict";
    angular.module("services")
        .factory("CustomizeService", CustomizeService);

    CustomizeService.$inject = [
        'Restangular'
    ];

    function CustomizeService(Restangular) {
        let customizationSettings = null;
        return {
            getCustomizationsSync: getCustomizationsSync,
            getCustomizations: getCustomizations,
            setCustomizations: setCustomizations,
            resetCustomizations: resetCustomizations
        };

        function getCustomizationsSync() {
            return customizationSettings;
        }

        /* jshint ignore:start */
        async function getCustomizations() {
            if (!customizationSettings)
                await refreshCustomizeSettings();

            return customizationSettings;
        }

        async function setCustomizations(customizations) {
            const formData = new FormData();
            formData.append('institute', JSON.stringify(customizations.institute));
            formData.append('footer', JSON.stringify(customizations.footer));
            if (customizations.logos && customizations.logos.header && customizations.logos.header.file) {
                formData.append('headerLogo', customizations.logos.header.file);
            }
            if (customizations.logos && customizations.logos.institute && customizations.logos.institute.file) {
                formData.append('instituteIcon', customizations.logos.institute.file);
            }
            formData.append('styles', JSON.stringify(customizations.styles));
            const res = await Restangular.one('customize').customPOST(formData, '', undefined, {'Content-Type': undefined});
            await refreshCustomizeSettings();
            return res;
        }

        async function resetCustomizations() {
            const formData = new FormData();
            const res = await Restangular.one('customize', 'reset').customPOST(formData, '', undefined, {'Content-Type': undefined});
            await refreshCustomizeSettings();
            return res;
        }

        async function refreshCustomizeSettings() {
            customizationSettings = await Restangular.one('customize').get();
        }

        /* jshint ignore:end */
    }
})();