(function () {
    'use strict';

    angular.module('profile')
        .component('profileDocumentsBlock', {
            templateUrl: 'partials/profile-documents-block.html',
            controller: profileDocumentsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                documents: '<',
                favoriteDocuments: '<',
                loadingDocuments: '<',
                urlFavoriteDocuments: '<',
                urlAllDocuments: '<',
            }
        });

    profileDocumentsBlock.$inject = [];

    function profileDocumentsBlock() {
    }

})();