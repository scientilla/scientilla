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
            addItem: addItem,
            removeItem: removeItem,
            getPrivacyDropdownText: getPrivacyDropdownText,
            getFavoriteTooltipText: getFavoriteTooltipText,
            getDatepickerOptions: getDatepickerOptions
        };

        function addItem (options = {}) {
            if (!options.item) {
                options.item = {
                    privacy: 'hidden'
                };
            }

            if (options.property) {
                options.property.push(options.item);
            }
        }

        function removeItem (options = {}) {
            if (typeof(options.property) !== 'undefined' && typeof(options.index) !== 'undefined') {
                options.property.splice(options.index, 1);
            }
        }

        function getPrivacyDropdownText(option) {
            switch(option) {
                case 'public':
                    return `<i class="fas fa-globe-europe fa-left privacy-icon"></i><strong>Public</strong>
                        <span class="privacy-info">Visible on Scientilla and the public website.</span>`;
                case 'hidden':
                    return `<i class="fas fa-lock fa-left privacy-icon"></i><strong>Locked</strong>
                        <span class="privacy-info">Only visible on Scientilla.</span>`;
                case 'invisible':
                    return `<i class="fas fa-eye-slash fa-left privacy-icon"></i><strong>Not visible</strong>
                        <span class="privacy-info">Only visible during editing.</span>`;
                default:
                    return 'No correct option!';
            }
        }

        function getFavoriteTooltipText() {
            return 'Favorite this item to show it on your profile overview.';
        }

        function getDatepickerOptions() {
            return {
                showWeeks: false
            };
        }

        /* jshint ignore:start */
        async function exportProfile(user, type, options = {}) {
            const data = {
                type: type,
                options: options
            };
            return Restangular.one('researchentities', user.researchEntity).one('profile').customPOST(data, 'export');
        }
        /* jshint ignore:end */
    }
})();