(function () {
    'use strict';

    angular.module('profile')
        .component('profileBasicInformationForm', {
            templateUrl: 'partials/profile-basic-information-form.html',
            controller: profileBasicInformationForm,
            controllerAs: 'vm',
            bindings: {}
        });

    profileBasicInformationForm.$inject = ['$scope'];

    function profileBasicInformationForm($scope) {
        const vm = this;

        vm.basicInformation = [];
        vm.profile = {};

        vm.$onInit = function () {
            $scope.$on('setupBasicInformation', (evt, profile) => {
                vm.profile = profile;
                setupBasicInformation();
            });
        };

        function setupBasicInformation () {
            if (_.has(vm.profile, 'username.value') && _.has(vm.profile, 'username.privacy')) {
                vm.basicInformation.push({
                    label: 'Username (Email)',
                    value: vm.profile.username.value,
                    model: 'username',
                    disableInvisible: true
                });
            }

            if (_.has(vm.profile, 'name.value') && _.has(vm.profile, 'name.privacy')) {
                vm.basicInformation.push({
                    label: 'Name',
                    value: vm.profile.name.value,
                    model: 'name',
                    disableInvisible: true
                });
            }

            if (_.has(vm.profile, 'surname.value') && _.has(vm.profile, 'surname.privacy')) {
                vm.basicInformation.push({
                    label: 'Surname',
                    value: vm.profile.surname.value,
                    model: 'surname',
                    disableInvisible: true
                });
            }

            if (_.has(vm.profile, 'jobTitle.value') && _.has(vm.profile, 'jobTitle.privacy')) {
                vm.basicInformation.push({
                    label: 'Job title',
                    value: vm.profile.jobTitle.value,
                    model: 'jobTitle',
                    disableInvisible: true
                });
            }

            if (_.has(vm.profile, 'phone.value') && _.has(vm.profile, 'phone.privacy')) {
                vm.basicInformation.push({
                    label: 'Phone',
                    value: vm.profile.phone.value,
                    model: 'phone',
                    disableInvisible: true
                });
            }

            if (_.has(vm.profile, 'centers') && vm.profile.centers.length > 0) {
                const items = [];
                for (let i = 0; i < vm.profile.centers.length; i++) {
                    const center = vm.profile.centers[i];
                    items.push({
                        value: center.value,
                        context: 'centers[' + i + ']',
                        model: 'centers',
                        disableInvisible: true
                    });
                }
                vm.basicInformation.push({
                    type: 'array',
                    title: 'Centers',
                    items: items
                });
            }

            if (_.has(vm.profile, 'facilities') && vm.profile.facilities.length > 0) {
                const items = [];
                for (let i = 0; i < vm.profile.facilities.length; i++) {
                    const facility = vm.profile.facilities[i];
                    items.push({
                        value: facility.value,
                        context: 'facilities[' + i + ']',
                        model: 'facilities',
                        disableInvisible: true
                    });
                }
                vm.basicInformation.push({
                    type: 'array',
                    title: 'Facilities',
                    items: items
                });
            }

            if (_.has(vm.profile, 'researchLines') && vm.profile.researchLines.length > 0) {
                const items = [];
                for (let i = 0; i < vm.profile.researchLines.length; i++) {
                    const researchLine = vm.profile.researchLines[i];
                    items.push({
                        value: researchLine.value,
                        context: 'researchLines[' + i + ']',
                        model: 'researchLines',
                        disableInvisible: true
                    });
                }
                vm.basicInformation.push({
                    type: 'array',
                    title: 'Research lines',
                    items: items
                });
            }

            if (_.has(vm.profile, 'administrativeOrganization.value') && _.has(vm.profile, 'administrativeOrganization.privacy')) {
                vm.basicInformation.push({
                    label: 'Administrative Organization',
                    value: vm.profile.administrativeOrganization.value,
                    model: 'administrativeOrganization',
                    disableInvisible: true
                });
            }

            if (_.has(vm.profile, 'office.value') && _.has(vm.profile, 'office.privacy')) {
                vm.basicInformation.push({
                    label: 'Office',
                    value: vm.profile.office.value,
                    model: 'office',
                    disableInvisible: true
                });
            }
        }
    }

})();