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
            getPrivacyTooltipText: getPrivacyTooltipText,
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

        function getPrivacyTooltipText(options) {

            switch (true) {
                case
                    _.includes(options, 'public') &&
                    !_.includes(options, 'hidden') &&
                    !_.includes(options, 'invisible')
                :
                    return 'This field can only be public!';
                case
                    !_.includes(options, 'public') &&
                    _.includes(options, 'hidden') &&
                    !_.includes(options, 'invisible')
                :
                    return 'This field can only be hidden!';
                case
                    !_.includes(options, 'public') &&
                    _.includes(options, 'hidden') &&
                    _.includes(options, 'invisible')
                :
                    return 'Set the privacy of this field to only for Scientilla users or hide it completely';
                case
                    _.includes(options, 'public') &&
                    _.includes(options, 'hidden') &&
                    _.includes(options, 'invisible')
                :
                    return 'Set the privacy of this field to public, only for Scientilla users or hide it completely';
                default:
                    return 'No correct option!';
            }
        }

        function getFavoriteTooltipText() {
            return 'Favorite this item to show it on your profile overview.';
        }

        function getDatepickerOptions() {
            return {
                showWeeks: false,
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