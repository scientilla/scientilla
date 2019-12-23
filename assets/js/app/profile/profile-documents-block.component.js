(function () {
    'use strict';

    angular.module('profile')
        .component('profileDocumentsBlock', {
            templateUrl: 'partials/profile-documents-block.html',
            controller: profileDocumentsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                documentsBySourceType: '<',
                favoriteDocuments: '<'
            }
        });

    profileDocumentsBlock.$inject = ['$uibModal', '$scope'];

    function profileDocumentsBlock($uibModal, $scope) {
        const vm = this;

        vm.$onInit = function () {

        };

        vm.showDocumentsModal = () => {
            $uibModal.open({
                animation: true,
                template:
                    `<div class="modal-header">
                            <h3 class="text-capitalize">Documents</h3>
                            <button
                                type="button"
                                class="close"
                                ng-click="close()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="modal-body profile">
                            <ul class="document-categories">
                                <li ng-repeat="(sourceType, documents) in vm.documentsBySourceType">
                                    <span class="document-category">{{ sourceType }}</span>
                                    <ul class="document-listing">
                                        <li ng-repeat="document in documents">
                                            <h4 class="document-title">{{ document.title}}</h4>
                                            <div class="document-source">
                                                <i ng-class="vm.getSourceTypeIcon(sourceType)" title="{{ sourceType }}"></i>
                                                <span>{{ document.source.title }}</span>
                                            </div>
                                            <ul class="document-details" ng-if="document.doi">
                                                <li><strong>DOI: </strong><a href="#">{{ document.doi }}</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>`,
                scope: $scope,
                controller: ($scope, $uibModalInstance) => {
                    $scope.close = () => {
                        $uibModalInstance.close();
                    };
                },
                size: 'lg'
            });
        };
    }

})();