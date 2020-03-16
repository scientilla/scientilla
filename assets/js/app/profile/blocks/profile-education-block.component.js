(function () {
    'use strict';

    angular.module('profile')
        .component('profileEducationBlock', {
            templateUrl: 'partials/profile-education-block.html',
            controller: profileEducationBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileEducationBlock.$inject = ['$uibModal', '$scope', 'TextService'];

    function profileEducationBlock($uibModal, $scope, TextService) {
        const vm = this;

        vm.$onInit = function () {

        };

        vm.joinStrings = (strings, seperator) => {
            return TextService.joinStrings(strings, seperator);
        };

        vm.showEducationsModal = () => {
            $uibModal.open({
                animation: true,
                template:
                    `<div class="modal-header">
                        <h3 class="text-capitalize">Education</h3>
                        <button
                            type="button"
                            class="close"
                            ng-click="close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="modal-body profile-modal education">
                        <ul class="education-listing">
                            <li ng-repeat="education in vm.profile.education">
                                <span class="institute">{{ education.institution }}</span>
                                <span class="title">{{ education.title }}</span>
                                <span class="period">{{ education.from | date: 'dd/MM/yyyy' }} - {{ education.to ? (education.to | date: 'dd/MM/yyyy') : 'present' }}</span>
                                <span
                                    class="location"
                                    ng-if="education.location || education.country">
                                    {{ vm.joinStrings([education.location, education.country], ' - ') }}
                                </span>
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