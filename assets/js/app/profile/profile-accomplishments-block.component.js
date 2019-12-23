(function () {
    'use strict';

    angular.module('profile')
        .component('profileAccomplishmentsBlock', {
            templateUrl: 'partials/profile-accomplishments-block.html',
            controller: profileAccomplishmentsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                accomplishmentsByType: '<'
            }
        });

    profileAccomplishmentsBlock.$inject = ['$uibModal', '$scope'];

    function profileAccomplishmentsBlock($uibModal, $scope) {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.showAccomplishmentsModal = () => {
            $uibModal.open({
                animation: true,
                template:
                    `<div class="modal-header">
                            <h3 class="text-capitalize">Accomplishments</h3>
                            <button
                                type="button"
                                class="close"
                                ng-click="close()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="modal-body profile">
                            <ul class="accomplishment-categories">
                                <li ng-repeat="(type, accomplishments) in vm.accomplishmentsByType">
                                    <span class="accomplishment-category">{{ type }}</span>
                                    <ul class="accomplishment-listing">
                                        <li ng-repeat="accomplishment in accomplishments">
                                            <h4 class="accomplishment-title">{{ accomplishment.title }}</h4>
                                            <ul class="accomplishment-details">
                                                <li ng-if="accomplishment.issuer">
                                                    <strong>Issuer: </strong>{{ accomplishment.issuer }}
                                                </li>
                                                <li ng-if="accomplishment.year">
                                                    <strong>Year: </strong>{{ accomplishment.year }}
                                                </li>
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