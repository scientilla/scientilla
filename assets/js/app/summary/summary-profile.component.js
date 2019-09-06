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
            '$element',
            '$uibModal',
            'AuthService',
            'ProfileService',
        ];

        function SummaryProfileComponent($element, $uibModal, AuthService, ProfileService) {
            const vm = this;

            vm.$onInit = () => {

            };

            vm.$onDestroy = () => {
                const unregisterTab = requireParentMethod($element, 'unregisterTab');
                unregisterTab(vm);
            };

            /* jshint ignore:start */
            vm.exportProfile = async (type) => {
                vm.user = AuthService.user;
                const data = await ProfileService.exportProfile(vm.user, type);
                var a = document.createElement('a');
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
                                <li>
                                    <img src="https://via.placeholder.com/150x100" alt="" class="img-fluid logo">
                                    <span class="company">Company</span>
                                    <ul class="job-listing">
                                        <li>
                                            <span class="job-title">Job title</span>
                                            <span class="period">From  - to</span>
                                            <span class="location">Location, Country</span>
                                            <p class="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                                scrambled it to make a type specimen book. It has survived not only five centuries</p>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <img src="https://via.placeholder.com/150x100" alt="" class="img-fluid logo">
                                    <span class="company">Company</span>
                                    <span class="company-description">Amount of years if multiple jobs</span>
                                    <ul class="job-listing multiple">
                                        <li>
                                            <span class="job-title">Job title</span>
                                            <span class="period">From  - to</span>
                                            <span class="location">Location, Country</span>
                                            <p class="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                                scrambled it to make a type specimen book. It has survived not only five centuries</p>
                                        </li>
                                        <li>
                                            <span class="job-title">Job title</span>
                                            <span class="period">From  - to</span>
                                            <span class="location">Location, Country</span>
                                            <p class="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                                scrambled it to make a type specimen book. It has survived not only five centuries</p>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <img src="https://via.placeholder.com/150x100" alt="" class="img-fluid logo">
                                    <span class="company">Company</span>
                                    <ul class="job-listing">
                                        <li>
                                            <span class="job-title">Job title</span>
                                            <span class="period">From  - to</span>
                                            <span class="location">Location, Country</span>
                                            <p class="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                                scrambled it to make a type specimen book. It has survived not only five centuries</p>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>`,
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
                                <li>
                                    <img src="https://via.placeholder.com/150x100" alt="" class="img-fluid logo">
                                    <span class="institute">University/Institute</span>
                                    <span class="title">Title</span>
                                    <span class="period">From - to</span>
                                    <span class="location">Location - Country</span>
                                </li>
                                <li>
                                    <img src="https://via.placeholder.com/150x100" alt="" class="img-fluid logo">
                                    <span class="institute">University/Institute</span>
                                    <span class="title">Title</span>
                                    <span class="period">From - to</span>
                                    <span class="location">Location - Country</span>
                                </li>
                                <li>
                                    <img src="https://via.placeholder.com/150x100" alt="" class="img-fluid logo">
                                    <span class="institute">University/Institute</span>
                                    <span class="title">Title</span>
                                    <span class="period">From - to</span>
                                    <span class="location">Location - Country</span>
                                </li>
                                <li>
                                    <img src="https://via.placeholder.com/150x100" alt="" class="img-fluid logo">
                                    <span class="institute">University/Institute</span>
                                    <span class="title">Title</span>
                                    <span class="period">From - to</span>
                                    <span class="location">Location - Country</span>
                                </li>
                            </ul>
                        </div>`,
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
                                <li>
                                    <span class="title">Title of certificate</span>
                                    <p class="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                        scrambled it to make a type specimen book. It has survived not only five centuries</p>
                                    <span class="date">date</span>
                                </li>
                                <li>
                                    <span class="title">Title of certificate</span>
                                    <p class="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                        scrambled it to make a type specimen book. It has survived not only five centuries</p>
                                    <span class="date">date</span>
                                </li>
                                <li>
                                    <span class="title">Title of certificate</span>
                                    <p class="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                        scrambled it to make a type specimen book. It has survived not only five centuries</p>
                                    <span class="date">date</span>
                                </li>
                            </ul>
                        </div>`,
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
                                <li>
                                    <span class="skill-category">Industry Knowledge</span>
                                    <ul class="skill-listing">
                                        <li>E-commerce</li>
                                        <li>Integration</li>
                                        <li>Strategy</li>
                                        <li>Marketing</li>
                                        <li>Big Data</li>
                                        <li>Virualization</li>
                                        <li>Mobile devices</li>
                                    </ul>
                                </li>
                                <li>
                                    <span class="skill-category">Tools & Technologies</span>
                                    <ul class="skill-listing">
                                        <li>Python</li>
                                        <li>C#</li>
                                        <li>C++</li>
                                        <li>HTML</li>
                                        <li>JavaScript</li>
                                        <li>CSS</li>
                                    </ul>
                                </li>
                                <li>
                                    <span class="skill-category">Interpersonal Skills</span>
                                    <ul class="skill-listing">
                                        <li>Strategic partnerships</li>
                                        <li>Business alliances</li>
                                        <li>Cross-functional team leadership</li>
                                        <li>Leadership</li>
                                        <li>Team building</li>
                                        <li>Executive management</li>
                                    </ul>
                                </li>
                                <li>
                                    <span class="skill-category">Languages</span>
                                    <ul class="skill-listing">
                                        <li>English</li>
                                        <li>French</li>
                                        <li>Italian</li>
                                        <li>Dutch</li>
                                        <li>German</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>`,
                    controller: ($scope, $uibModalInstance) => {
                        $scope.close = () => {
                            $uibModalInstance.close();
                        };
                    },
                    size: 'lg'
                });
            };

            vm.showPublicationsModal = () => {
                $uibModal.open({
                    animation: true,
                    template:
                        `<div class="modal-header">
                            <h3 class="text-capitalize">Publications</h3>
                            <button
                                type="button"
                                class="close"
                                ng-click="close()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="modal-body profile">
                            <ul class="publication-categories">
                                <li>
                                    <span class="publication-category">Journal</span>
                                    <ul class="publication-listing">
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="fas fa-file-alt" title="Journal"></i>
                                                <span>
                                                    Investigative Ophthalmology and Visual Science
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="fas fa-file-alt" title="Journal"></i>
                                                <span>
                                                    Investigative Ophthalmology and Visual Science
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="fas fa-file-alt" title="Journal"></i>
                                                <span>
                                                    Investigative Ophthalmology and Visual Science
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <span class="publication-category">Book</span>
                                    <ul class="publication-listing">
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="fas fa-book" title="Book"></i>
                                                <span>
                                                    PhD Thesis
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="fas fa-book" title="Book"></i>
                                                <span>
                                                    PhD Thesis
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <span class="publication-category">Conference</span>
                                    <ul class="publication-listing">
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="far fa-comment" title="Conference"></i>
                                                <span>
                                                    international winterschool in bioelectronics
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="far fa-comment" title="Conference"></i>
                                                <span>
                                                    international winterschool in bioelectronics
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="far fa-comment" title="Conference"></i>
                                                <span>
                                                    international winterschool in bioelectronics
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="publication-title">Lorem Ipsum is simply dummy text of the printing and typesetting industry</h4>
                                            <div class="document-source">
                                                <i class="far fa-comment" title="Conference"></i>
                                                <span>
                                                    international winterschool in bioelectronics
                                                </span>
                                            </div>
                                            <ul class="publication-details">
                                                <li><strong>DOI: </strong><a href="#">10.1093</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>`,
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
                                <li>
                                    <span class="accomplishment-category">Award / Achievement</span>
                                    <ul class="accomplishment-listing">
                                        <li>
                                            <h4 class="accomplishment-title">Lorem Ipsum is simply dummy text</h4>
                                            <ul class="accomplishment-details">
                                                <li><strong>Issuer: </strong>Lorem ipsum</li>
                                                <li><strong>Year:</strong> 2019</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="accomplishment-title">Lorem Ipsum is simply dummy text</h4>
                                            <ul class="accomplishment-details">
                                                <li><strong>Issuer: </strong>Lorem ipsum</li>
                                                <li><strong>Year:</strong> 2019</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <span class="accomplishment-category">Organized Event</span>
                                    <ul class="accomplishment-listing">
                                        <li>
                                            <h4 class="accomplishment-title">Lorem Ipsum is simply dummy text</h4>
                                            <ul class="accomplishment-details">
                                                <li><strong>Issuer: </strong>Lorem ipsum</li>
                                                <li><strong>Year:</strong> 2019</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="accomplishment-title">Lorem Ipsum is simply dummy text</h4>
                                            <ul class="accomplishment-details">
                                                <li><strong>Issuer: </strong>Lorem ipsum</li>
                                                <li><strong>Year:</strong> 2019</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="accomplishment-title">Lorem Ipsum is simply dummy text</h4>
                                            <ul class="accomplishment-details">
                                                <li><strong>Issuer: </strong>Lorem ipsum</li>
                                                <li><strong>Year:</strong> 2019</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <span class="accomplishment-category">Editorship</span>
                                    <ul class="accomplishment-listing">
                                        <li>
                                            <h4 class="accomplishment-title">Lorem Ipsum is simply dummy text</h4>
                                            <ul class="accomplishment-details">
                                                <li><strong>Issuer: </strong>Lorem ipsum</li>
                                                <li><strong>Year:</strong> 2019</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h4 class="accomplishment-title">Lorem Ipsum is simply dummy text</h4>
                                            <ul class="accomplishment-details">
                                                <li><strong>Issuer: </strong>Lorem ipsum</li>
                                                <li><strong>Year:</strong> 2019</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>`,
                    controller: ($scope, $uibModalInstance) => {
                        $scope.close = () => {
                            $uibModalInstance.close();
                        };
                    },
                    size: 'lg'
                });
            };
        }
    }

)();