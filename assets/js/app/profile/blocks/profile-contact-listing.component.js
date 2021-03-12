(function () {
    'use strict';

    angular.module('profile')
        .component('profileContactListing', {
            templateUrl: 'partials/profile-contact-listing.html',
            controller: profileContactListing,
            controllerAs: 'vm',
            bindings: {
                user: '<',
                profile: '<',
            }
        });

    profileContactListing.$inject = [];

    function profileContactListing() {
        const vm = this;

        vm.$onInit = function () {
        };
    }

})();