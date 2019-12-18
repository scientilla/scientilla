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
            vm.documentsBySourceType = [];
            vm.favoriteDocuments = [];
            vm.accomplishmentsByType = [];
            vm.favoriteAccomplishments = [];

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

            function getDocumentsBySourceType(profile) {
                if (!_.isEmpty(profile.documents)) {
                    return _.groupBy(profile.documents, 'sourceTypeObj.label');
                }

                return [];
            }

            function getAccomplishmentsByType(profile) {
                if (!_.isEmpty(profile.accomplishments)) {
                    return _.groupBy(profile.accomplishments, 'type.label');
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

            function getProfile() {
                UsersService.getProfile(AuthService.user.researchEntity).then(response => {
                    vm.profile = response.plain();
                    vm.experiencesByCompany = getExperiencesByCompany(vm.profile);
                    vm.favoriteSkills = getFavoriteSkills(vm.profile);
                    vm.favoriteCertificates = getFavoriteCertificates(vm.profile);
                    vm.documentsBySourceType = getDocumentsBySourceType(vm.profile);
                    vm.favoriteDocuments = getFavoriteDocuments(vm.profile);
                    vm.accomplishmentsByType = getAccomplishmentsByType(vm.profile);
                    //vm.favoriteAccomplishments = [];
                    console.log(vm.accomplishmentsByType);
                });
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
                                            <span class="location">{{ experience.location }}, {{ experience.country }}</span>
                                            <div class="description">{{ experience.jobDescription }}</div>
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
                                    <span class="location">{{ education.location }} - {{ education.country }}</span>
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
                                    <div class="description">{{ certificate.description }}</div>
                                    <span class="date">{{ certificate.date | date: 'dd/MM/yyyy' }}</span>
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

            /* jshint ignore:start */
            vm.exportProfile = async (type) => {
                const data = await ProfileService.exportProfile(AuthService.user, type);
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