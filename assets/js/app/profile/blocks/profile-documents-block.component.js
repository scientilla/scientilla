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
                urlFavoriteDocuments: '<',
                urlAllDocuments: '<',
            }
        });

    profileDocumentsBlock.$inject = ['context', '$scope'];

    function profileDocumentsBlock(context, $scope) {
        const vm = this;

        vm.documentsBySourceType = [];
        vm.favoriteDocuments = [];

        let documentsWatcher = null;

        vm.$onInit = function () {
            documentsWatcher = $scope.$watch('vm.documents', function(evt){
                vm.documentsBySourceType = getDocumentsBySourceType(vm.documents);
                vm.favoriteDocuments = getFavoriteDocuments(vm.documents);
            }, true);
        };

        vm.$onDestroy = function () {
            if (documentsWatcher) {
                documentsWatcher();
            }
        };

        function getDocumentsBySourceType(documents) {
            if (!_.isEmpty(documents)) {
                return _.groupBy(documents, 'sourceTypeObj.label');
            }

            return [];
        }

        function getFavoriteDocuments(documents) {
            const subResearchEntity = context.getSubResearchEntity();
            if (!_.isEmpty(documents)) {
                return documents.filter(document => {
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