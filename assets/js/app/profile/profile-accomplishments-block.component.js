(function () {
    'use strict';

    angular.module('profile')
        .component('profileAccomplishmentsBlock', {
            templateUrl: 'partials/profile-accomplishments-block.html',
            controller: profileAccomplishmentsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileAccomplishmentsBlock.$inject = ['context'];

    function profileAccomplishmentsBlock(context) {
        const vm = this;

        vm.accomplishmentsByType = [];
        vm.favoriteAccomplishments = [];

        vm.$onInit = function () {
            vm.accomplishmentsByType = getAccomplishmentsByType(vm.profile);
            vm.favoriteAccomplishments = getFavoriteAccomplishments(vm.profile);
        };

        function getAccomplishmentsByType(profile) {
            if (!_.isEmpty(profile.accomplishments)) {
                return _.groupBy(profile.accomplishments, 'type.label');
            }

            return [];
        }

        function getFavoriteAccomplishments(profile) {
            const subResearchEntity = context.getSubResearchEntity();
            if (!_.isEmpty(profile.accomplishments)) {
                return profile.accomplishments.filter(accomplishment => {
                    if (_.has(accomplishment, 'verified')) {
                        const verifiedAccomplishment = accomplishment.verified.find(
                            a => a.researchEntity === subResearchEntity.researchEntity
                        );

                        if (verifiedAccomplishment && verifiedAccomplishment.favorite) {
                            return accomplishment;
                        }
                    }
                });
            }

            return [];
        }
    }

})();