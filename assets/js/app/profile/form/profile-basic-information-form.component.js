(function () {
    'use strict';

    angular.module('profile')
        .component('profileBasicInformationForm', {
            templateUrl: 'partials/profile-basic-information-form.html',
            controller: profileBasicInformationForm,
            controllerAs: 'vm',
            bindings: {
                profile: '='
            }
        });

    profileBasicInformationForm.$inject = ['$scope'];

    function profileBasicInformationForm($scope) {
        const vm = this;

        vm.basicInformation = [];

        vm.$onInit = function () {
            setupBasicInformation();

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
                    model: 'username'
                });
            }

            if (_.has(vm.profile, 'name.value') && _.has(vm.profile, 'name.privacy')) {
                vm.basicInformation.push({
                    label: 'Name',
                    value: vm.profile.name.value,
                    model: 'name'
                });
            }

            if (_.has(vm.profile, 'surname.value') && _.has(vm.profile, 'surname.privacy')) {
                vm.basicInformation.push({
                    label: 'Surname',
                    value: vm.profile.surname.value,
                    model: 'surname'
                });
            }

            if (_.has(vm.profile, 'jobTitle.value') && _.has(vm.profile, 'jobTitle.privacy')) {
                vm.basicInformation.push({
                    label: 'Job title',
                    value: vm.profile.jobTitle.value,
                    model: 'jobTitle'
                });
            }

            if (_.has(vm.profile, 'phone.value') && _.has(vm.profile, 'phone.privacy')) {
                vm.basicInformation.push({
                    label: 'Phone',
                    value: vm.profile.phone.value,
                    model: 'phone'
                });
            }

            if (_.has(vm.profile, 'centers') && vm.profile.centers.length > 0) {
                const items = [];
                for (let i = 0; i < vm.profile.centers.length; i++) {
                    const center = vm.profile.centers[i];
                    items.push({
                        value: center.name,
                        privacy: center.privacy,
                        errors: center.errors,
                        context: 'centers[' + i + ']',
                        model: 'centers'
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
                        value: facility.name,
                        privacy: facility.privacy,
                        errors: facility.errors,
                        context: 'facilities[' + i + ']',
                        model: 'facilities'
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
                        value: researchLine.name,
                        privacy: researchLine.privacy,
                        errors: researchLine.errors,
                        context: 'researchLines[' + i + ']',
                        model: 'researchLines'
                    });
                }
                vm.basicInformation.push({
                    type: 'array',
                    title: 'Research lines',
                    items: items
                });
            }

            if (
                _.has(vm.profile, 'directorate.value') &&
                _.has(vm.profile, 'directorate.privacy')
            ) {
                vm.basicInformation.push({
                    label: 'Directorate',
                    value: vm.profile.directorate.value,
                    model: 'directorate'
                });
            }

            if (_.has(vm.profile, 'office.value') && _.has(vm.profile, 'office.privacy')) {
                vm.basicInformation.push({
                    label: 'Office',
                    value: vm.profile.office.value,
                    model: 'office'
                });
            }
        }
    }

})();