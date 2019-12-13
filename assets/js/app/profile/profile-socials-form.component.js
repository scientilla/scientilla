(function () {
    'use strict';

    angular.module('profile')
        .component('profileSocialsForm', {
            templateUrl: 'partials/profile-socials-form.html',
            controller: profileSocialsForm,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                errors: '<'
            }
        });

    profileSocialsForm.$inject = [];

    function profileSocialsForm() {
        const vm = this;

        vm.socials = [];

        vm.$onInit = function () {
            // Socials
            vm.socials.push({
                label: '<i class="fab fa-linkedin fa-left"></i>Linkedin',
                placeholder: 'Linkedin URL',
                model: 'linkedin'
            });

            vm.socials.push({
                label: '<i class="fab fa-twitter fa-left"></i>Twitter',
                placeholder: 'Twitter URL',
                model: 'twitter'
            });

            vm.socials.push({
                label: '<i class="fab fa-facebook-square fa-left"></i>Facebook',
                placeholder: 'Facebook URL',
                model: 'facebook'
            });

            vm.socials.push({
                label: '<i class="fab fa-instagram fa-left"></i>Instagram',
                placeholder: 'Instagram URL',
                model: 'instagram'
            });

            vm.socials.push({
                label: '<i class="fab fa-researchgate fa-left"></i>Researchgate',
                placeholder: 'Researchgate URL',
                model: 'researchgate'
            });

            vm.socials.push({
                label: '<i class="fab fa-github fa-left"></i>Github',
                placeholder: 'Github URL',
                model: 'github'
            });

            vm.socials.push({
                label: '<i class="fab fa-bitbucket fa-left"></i>Bitbucket',
                placeholder: 'Bitbucket URL',
                model: 'bitbucket'
            });

            vm.socials.push({
                label: '<i class="fab fa-youtube fa-left"></i>YouTube',
                placeholder: 'YouTube URL',
                model: 'youtube'
            });

            vm.socials.push({
                label: '<i class="fab fa-flickr fa-left"></i>Flickr',
                placeholder: 'Flickr URL',
                model: 'flickr'
            });
        };
    }

})();