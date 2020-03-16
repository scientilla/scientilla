(function () {
    'use strict';

    angular.module('profile')
        .component('profileExperiencesBlock', {
            templateUrl: 'partials/profile-experiences-block.html',
            controller: profileExperiencesBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileExperiencesBlock.$inject = ['$uibModal', '$scope', 'TextService'];

    function profileExperiencesBlock($uibModal, $scope, TextService) {
        const vm = this;

        vm.experiencesByCompany = [];

        vm.$onInit = function () {
            if (!_.isEmpty(vm.profile)) {
                vm.experiencesByCompany = getExperiencesByCompany(vm.profile);
            }
        };

        function getExperiencesByCompany(profile) {
            if (!_.isEmpty(profile.experiences)) {
                return _.groupBy(profile.experiences, 'company');
            }

            return [];
        }

        vm.joinStrings = (strings, seperator) => {
            return TextService.joinStrings(strings, seperator);
        };

        vm.showExperiencesModal = () => {
            $uibModal.open({
                animation: true,
                template:
                    `<div class="modal-header">
                        <h3 class="text-capitalize">Experiences</h3>
                        <button
                            type="button"
                            class="close"
                            ng-click="close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="modal-body profile-modal experiences">
                        <ul class="company-listing">
                            <li ng-repeat="(company, experiences) in vm.experiencesByCompany">
                                <span class="company">{{ company }}</span>
                                <ul class="job-listing" ng-class="experiences.length > 1 ? 'multiple' : ''">
                                    <li ng-repeat="experience in experiences">
                                        <span class="job-title">{{ experience.jobTitle }}</span>
                                        <span class="period">{{ experience.from | date: 'dd/MM/yyyy' }} - {{ experience.to ? (experience.to | date: 'dd/MM/yyyy') : 'present' }}</span>
                                        <span
                                            class="location"
                                            ng-if="experience.location || experience.country">
                                            {{ vm.joinStrings([experience.location, experience.country], ', ') }}
                                        </span>
                                        <div
                                            class="description"
                                            ng-if="experience.jobDescription">
                                            {{ experience.jobDescription }}
                                        </div>
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