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

    profileBasicInformationForm.$inject = ['$scope', 'TextService', 'ISO3166'];

    function profileBasicInformationForm($scope, TextService, ISO3166) {
        const vm = this;

        vm.basicInformation = [];

        vm.$onInit = function () {
            setupBasicInformation();

            $scope.$on('setupBasicInformation', (evt, profile) => {
                vm.profile = profile;
                setupBasicInformation();
            });
        };

        vm.joinStrings = function (strings, seperator) {
            return TextService.joinStrings(strings, seperator);
        };

        function getGender(gender) {
            switch(gender) {
                case 'M':
                    return 'Male';
                case 'F':
                    return 'Female';
                default:
                    return '';
            }
        }

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

            if (_.has(vm.profile, 'roleCategory.value') && _.has(vm.profile, 'roleCategory.privacy')) {
                vm.basicInformation.push({
                    label: 'Role category',
                    value: vm.profile.roleCategory.value,
                    model: 'roleCategory'
                });
            }

            if (_.has(vm.profile, 'phone.value') && _.has(vm.profile, 'phone.privacy')) {
                vm.basicInformation.push({
                    label: 'Phone',
                    value: vm.profile.phone.value,
                    model: 'phone'
                });
            }

            if (_.has(vm.profile, 'gender.value') && _.has(vm.profile, 'gender.privacy')) {
                vm.basicInformation.push({
                    label: 'Gender',
                    value: getGender(vm.profile.gender.value),
                    model: 'gender'
                });
            }

            if (_.has(vm.profile, 'nationality.value') && _.has(vm.profile, 'nationality.privacy')) {
                vm.basicInformation.push({
                    label: 'Nationality',
                    value: ISO3166.getCountryName(vm.profile.nationality.value),
                    model: 'nationality',
                    info: 'Your nationality is only used in a group chart.'
                });
            }

            if (_.has(vm.profile, 'dateOfBirth.value') && _.has(vm.profile, 'dateOfBirth.privacy')) {
                vm.basicInformation.push({
                    label: 'Date of birth',
                    value: vm.profile.dateOfBirth.value,
                    model: 'dateOfBirth',
                    info: 'Your date of birth is only used for setting your age range, which is used in a group chart.'
                });
            }

            const directorates = vm.profile.groups.filter(group => group.type === 'Directorate');
            const researchLines = vm.profile.groups.filter(group => group.type === 'Research Line');
            const facilities = vm.profile.groups.filter(group => group.type === 'Facility');

            if (directorates.length > 0) {
                const items = [];
                for (const directorate of directorates) {
                    const groupIndex = vm.profile.groups.findIndex(
                        group => group.type === 'Directorate' && group.name === directorate.name
                    );

                    let value = directorate.name;
                    if (directorate.offices.length > 0) {
                        value = directorate.name + ' - ' + vm.joinStrings(directorate.offices, ', ');
                    }
                    items.push({
                        value: value,
                        privacy: directorate.privacy,
                        errors: directorate.errors,
                        context: 'groups[' + groupIndex + ']',
                        model: 'groups'
                    });
                }
                vm.basicInformation.push({
                    type: 'array',
                    title: 'Directorates & offices',
                    items: items
                });
            }

            if (researchLines.length > 0) {
                const items = [];
                for (const researchLine of researchLines) {
                    const groupIndex = vm.profile.groups.findIndex(
                        group => group.type === 'Research Line' && group.name === researchLine.name
                    );

                    let value = researchLine.name;
                    if (_.has(researchLine, 'center.name')) {
                        value = researchLine.name + ' - ' + researchLine.center.name;
                    }
                    items.push({
                        value: value,
                        privacy: researchLine.privacy,
                        errors: researchLine.errors,
                        context: 'groups[' + groupIndex + ']',
                        model: 'groups'
                    });
                }
                vm.basicInformation.push({
                    type: 'array',
                    title: 'Research lines',
                    items: items
                });
            }

            if (facilities.length > 0) {
                const items = [];
                for (const facility of facilities) {
                    const groupIndex = vm.profile.groups.findIndex(
                        group => group.type === 'Facility' && group.name === facility.name
                    );
                    let value = facility.name;
                    if (_.has(facility, 'center.name')) {
                        value = facility.name + ' - ' + facility.center.name;
                    }
                    items.push({
                        value: value,
                        privacy: facility.privacy,
                        errors: facility.errors,
                        context: 'groups[' + groupIndex + ']',
                        model: 'groups'
                    });
                }
                vm.basicInformation.push({
                    type: 'array',
                    title: 'Facilities',
                    items: items
                });
            }
        }
    }

})();