(function () {
    'use strict';

    angular.module('profile')
        .component('profileSkillsBlock', {
            templateUrl: 'partials/profile-skills-block.html',
            controller: profileSkillsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileSkillsBlock.$inject = ['$uibModal', '$scope'];

    function profileSkillsBlock($uibModal, $scope) {
        const vm = this;

        vm.favoriteSkills = [];

        vm.$onInit = function () {
            if (!_.isEmpty(vm.profile)) {
                vm.favoriteSkills = getFavoriteSkills(vm.profile);
            }
        };

        function getFavoriteSkills(profile) {
            const allSkills = [];
            const favoriteSkills = [];
            if (!_.isEmpty(profile.skillCategories)) {
                profile.skillCategories.map(category => {
                    if (!_.isEmpty(category.skills)) {
                        category.skills.map(skill => {
                            if (skill.favorite) {
                                favoriteSkills.push(skill);
                            }
                            allSkills.push(skill);
                        });
                    }
                });
            }

            if (favoriteSkills.length > 0) {
                return favoriteSkills;
            }

            return allSkills;
        }

        vm.showSkillsModal = () => {
            $uibModal.open({
                animation: true,
                template:
                    `<div class="modal-header">
                        <h3 class="text-capitalize">Skills</h3>
                        <button
                            type="button"
                            class="close"
                            ng-click="close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="modal-body profile-modal skills">
                        <ul class="skill-categories">
                            <li ng-repeat="category in vm.profile.skillCategories">
                                <span class="skill-category">{{ category.categoryName }}</span>
                                <ul class="skill-listing">
                                    <li ng-repeat="skill in category.skills">{{ skill }}</li>
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