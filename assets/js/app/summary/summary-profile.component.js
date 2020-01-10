(function () {
        "use strict";

        angular
            .module('summary')
            .component('summaryProfile', {
                templateUrl: 'partials/summary-profile.html',
                controller: SummaryProfileComponent,
                controllerAs: 'vm',
                bindings: {
                }
            });

        SummaryProfileComponent.$inject = [
            'UsersService',
            'AuthService',
            '$element',
            '$uibModal',
            '$scope',
            'context',
            'ProfileService'
        ];

        function SummaryProfileComponent(UsersService, AuthService, $element, $uibModal, $scope, context, ProfileService) {
            const vm = this;

            vm.experiencesByCompany = [];
            vm.favoriteSkills = [];
            vm.favoriteCertificates = [];
            vm.numberOfItems = 0;
            vm.loading = true;

            vm.exportOptions = {
                basic: true,
                socials: true,
                about: true,
                experiences: true,
                education: true,
                certificates: true,
                skills: true,
                documents: true,
                accomplishments: true
            };

            vm.$onInit = () => {
                getProfile();
            };

            vm.$onDestroy = () => {
                const unregisterTab = requireParentMethod($element, 'unregisterTab');
                unregisterTab(vm);
            };

            vm.getSourceTypeIcon = type => {
                switch(type) {
                    case 'Book Series' :
                        return 'fas fa-file-alt';
                    case 'Book' :
                        return 'fas fa-file-alt';
                    case 'Journal' :
                        return 'fas fa-book';
                    case 'Conference' :
                        return 'far fa-comment';
                    default:
                        return 'fas fa-file-alt';
                }
            };

            /*vm.getNumberOfItems = obj => {
                let length = 0;
                for (const item in obj) {
                    length += obj[item].length;
                }
                return length;
            };*/

            vm.joinStrings = (strings = [], seperator = ', ') => {
                return _.filter(strings).join(seperator);
            };

            function getFavoriteSkills(profile) {
                const allSkills = [];
                const favoriteSkills = [];
                if (!_.isEmpty(profile.skillCategories)) {
                    profile.skillCategories.map(category => {
                        category.skills.map(skill => {
                            if (skill.favorite) {
                                favoriteSkills.push(skill.value);
                            }
                            allSkills.push(skill.value);
                        });
                    });
                }

                if (favoriteSkills.length > 0) {
                    return favoriteSkills;
                }

                return allSkills;
            }

            function getFavoriteCertificates(profile) {
                const allCertificates = [];
                const favoriteCertificates = [];
                if (!_.isEmpty(profile.certificates)) {
                    profile.certificates.map(certificate => {
                        if (certificate.favorite) {
                            favoriteCertificates.push(certificate.title);
                        }
                        allCertificates.push(certificate.title);
                    });
                }

                if (favoriteCertificates.length > 0) {
                    return favoriteCertificates;
                }

                return allCertificates;
            }

            function getExperiencesByCompany(profile) {
                if (!_.isEmpty(profile.experiences)) {
                    return _.groupBy(profile.experiences, 'company');
                }

                return [];
            }

            function getProfile() {
                UsersService.getProfile(AuthService.user.researchEntity).then(response => {
                    vm.profile = response.plain();
                    vm.experiencesByCompany = getExperiencesByCompany(vm.profile);
                    vm.favoriteSkills = getFavoriteSkills(vm.profile);
                    vm.favoriteCertificates = getFavoriteCertificates(vm.profile);

                    setNumberOfItems();
                    vm.loading = false;
                });
            }

            function setNumberOfItems() {
                let count = 0;

                if (_.has(vm.profile, 'experiences') && vm.profile.experiences.length > 0) {
                    count++;
                }

                if (_.has(vm.profile, 'education') && vm.profile.education.length > 0) {
                    count++;
                }

                if (_.has(vm.profile, 'certificates') && vm.profile.certificates.length > 0) {
                    count++;
                }

                if (_.has(vm.profile, 'skillCategories') && vm.profile.skillCategories.length > 0) {
                    count++;
                }

                if (_.has(vm.profile, 'accomplishments') && vm.profile.accomplishments.length > 0) {
                    count++;
                }

                if (_.has(vm.profile, 'documents') && vm.profile.documents.length > 0) {
                    count++;
                }

                vm.numberOfItems = count;
            }

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

                        <div class="modal-body profile">
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

                        <div class="modal-body profile">
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

            vm.showCertificatesModal = () => {
                $uibModal.open({
                    animation: true,
                    template:
                        `<div class="modal-header">
                            <h3 class="text-capitalize">Certificates</h3>
                            <button
                                type="button"
                                class="close"
                                ng-click="close()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="modal-body profile">
                            <ul class="certificate-listing">
                                <li ng-repeat="certificate in vm.profile.certificates">
                                    <span class="title">{{ certificate.title }}</span>
                                    <div
                                        class="description"
                                        ng-if="certificate.description">{{ certificate.description }}</div>
                                    <span
                                        class="date"
                                        ng-if="certificate.date">{{ certificate.date | date: 'dd/MM/yyyy' }}</span>
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

                        <div class="modal-body profile">
                            <ul class="skill-categories">
                                <li ng-repeat="category in vm.profile.skillCategories">
                                    <span class="skill-category">{{ category.value }}</span>
                                    <ul class="skill-listing">
                                        <li ng-repeat="skill in category.skills">{{ skill.value }}</li>
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

            /* jshint ignore:start */
            vm.exportProfile = async (type) => {
                const data = await ProfileService.exportProfile(AuthService.user, type, vm.exportOptions);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.href = 'data:application/octet-stream;base64,' + data;

                switch (type) {
                    case 'doc':
                        a.download = 'profile.docx';
                        a.click();
                        break;
                    case 'pdf':
                        a.download = 'profile.pdf';
                        a.click();
                        break;
                    default:
                        break;
                }
            };
            /* jshint ignore:end */
        }
    }

)();