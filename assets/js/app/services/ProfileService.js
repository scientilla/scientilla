(function () {
    "use strict";
    angular.module("services")
        .factory("ProfileService", ProfileService);

    ProfileService.$inject = [
        'Restangular'
    ];

    function ProfileService(Restangular) {
        return {
            exportProfile: exportProfile,
        };

        /* jshint ignore:start */
        async function exportProfile(user, type) {
            const data = {
                type: type
            };
            return Restangular.one('users', user.id).one('profile').customPOST(data, 'export');
        };
        /* jshint ignore:end */
    }
})();