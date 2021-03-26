(function () {
    'use strict';

    angular.module('profile')
        .component('profileCertificatesBlock', {
            templateUrl: 'partials/profile-certificates-block.html',
            controller: profileCertificatesBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileCertificatesBlock.$inject = ['$uibModal', '$scope'];

    function profileCertificatesBlock($uibModal, $scope) {
        const vm = this;

        vm.favoriteCertificates = [];

        let watcher;

        vm.$onInit = function () {
            vm.favoriteCertificates = getFavoriteCertificates();

            watcher = $scope.$watch('vm.profile', () => {
                vm.favoriteCertificates = getFavoriteCertificates();
            });
        };

        vm.$onDestroy = function () {
            if (_.isFunction(watcher)) {
                watcher();
            }
        };

        function getFavoriteCertificates() {
            const allCertificates = [];
            const favoriteCertificates = [];
            if (!_.isEmpty(vm.profile && vm.profile.certificates)) {
                vm.profile.certificates.map(certificate => {
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

                        <div class="modal-body profile-modal certificates">
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
    }

})();