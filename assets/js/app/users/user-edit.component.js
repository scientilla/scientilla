(function () {
    'use strict';

    angular.module('users')
        .component('userEdit', {
            templateUrl: 'partials/user-edit.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'UsersService',
        'AuthService'
    ];

    function controller(UsersService, AuthService) {
        const vm = this;

        vm.titles = [];
        vm.experiences = [];
        vm.education = [];
        vm.certificates = [];
        vm.skillCategories = [];

        vm.datePickerOptions = {};
        vm.dateExperienceFromPopups = [];
        vm.dateExperienceToPopups = [];
        vm.dateEducationFromPopups = [];
        vm.dateEducationToPopups = [];
        vm.dateCertificateDatePopups = [];

        function getEditProfile() {
            UsersService.getProfile(AuthService.user.researchEntity, true).then(response => {
                vm.profile = response.plain();
            });
        }

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.profile = {};

            getEditProfile();
        };
        /* jshint ignore:end */

        vm.addItem = (options = {}) => {
            if (!options.item) {
                options.item = {
                    public: false
                };
            }

            if (options.property) {
                options.property.push(options.item);
            }

            console.log(vm.profile);
        };

        vm.removeItem = (options = {}) => {
            if (typeof(options.property) !== 'undefined' && typeof(options.index) !== 'undefined') {
                options.property.splice(options.index, 1);
            }
        };

        vm.save = () => {
            const profile = JSON.stringify(vm.profile);
            UsersService.saveProfile(AuthService.user.researchEntity, profile).then(response => {
                response = response.plain();
                vm.errors = response.errors;
                console.log(vm.errors);
                //vm.profile = ;
                //console.log(response.plain());
            });
        };
    }

})();