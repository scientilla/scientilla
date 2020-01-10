(function () {
    'use strict';

    angular.module('profile')
        .component('profileAccomplishmentsBlock', {
            templateUrl: 'partials/profile-accomplishments-block.html',
            controller: profileAccomplishmentsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileAccomplishmentsBlock.$inject = ['$uibModal', '$scope', 'context'];

    function profileAccomplishmentsBlock($uibModal, $scope, context) {
        const vm = this;

        vm.accomplishmentsByType = [];
        vm.favoriteAccomplishments = [];

        vm.$onInit = function () {
            vm.accomplishmentsByType = getAccomplishmentsByType(vm.profile);
            vm.favoriteAccomplishments = getFavoriteAccomplishments(vm.profile);
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

        function getAccomplishmentsByType(profile) {
            if (!_.isEmpty(profile.accomplishments)) {
                return _.groupBy(profile.accomplishments, 'type.label');
            }

            return [];
        }

        function getFavoriteAccomplishments(profile) {
            const subResearchEntity = context.getSubResearchEntity();
            if (!_.isEmpty(profile.accomplishments)) {
                return profile.accomplishments.filter(accomplishment => {
                    if (_.has(accomplishment, 'verified')) {
                        const verifiedAccomplishment = accomplishment.verified.find(
                            a => a.researchEntity === subResearchEntity.researchEntity
                        );

                        if (verifiedAccomplishment && verifiedAccomplishment.favorite) {
                            return accomplishment;
                        }
                    }
                });
            }

            return [];
        }
    }

})();