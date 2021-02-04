(function () {
    'use strict';

    angular.module('profile')
        .component('profileAccomplishmentsBlock', {
            templateUrl: 'partials/profile-accomplishments-block.html',
            controller: profileAccomplishmentsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                accomplishments: '<',
                favoriteAccomplishments: '<',
                loadingAccomplishments: '<',
                urlFavoriteAccomplishments: '<',
                urlAllAccomplishments: '<',
            }
        });

    profileAccomplishmentsBlock.$inject = [];

    function profileAccomplishmentsBlock() {
    }

})();