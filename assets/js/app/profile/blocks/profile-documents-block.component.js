(function () {
    'use strict';

    angular.module('profile')
        .component('profileDocumentsBlock', {
            templateUrl: 'partials/profile-documents-block.html',
            controller: profileDocumentsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                urlFavoriteDocuments: '<',
                urlAllDocuments: '<',
            }
        });

    profileDocumentsBlock.$inject = ['context'];

    function profileDocumentsBlock(context) {
        const vm = this;

        vm.documentsBySourceType = [];
        vm.favoriteDocuments = [];

        vm.$onInit = function () {
            vm.documentsBySourceType = getDocumentsBySourceType(vm.profile);
            vm.favoriteDocuments = getFavoriteDocuments(vm.profile);
        };

        function getDocumentsBySourceType(profile) {
            if (!_.isEmpty(profile.documents)) {
                return _.groupBy(profile.documents, 'sourceTypeObj.label');
            }

            return [];
        }

        function getFavoriteDocuments(profile) {
            const subResearchEntity = context.getSubResearchEntity();
            if (!_.isEmpty(profile.documents)) {
                return profile.documents.filter(document => {
                    let field;
                    if (subResearchEntity.getType() === 'user') {
                        field = 'authorships';
                    } else {
                        field = 'groupAuthorships';
                    }
                    const authorship = document[field].find(a => a.researchEntity === subResearchEntity.id);

                    if (authorship && authorship.favorite) {
                        return document;
                    }
                });
            }

            return [];
        }
    }

})();