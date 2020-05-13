(function () {
    'use strict';

    angular.module('profile')
        .component('profileAccomplishmentsBlock', {
            templateUrl: 'partials/profile-accomplishments-block.html',
            controller: profileAccomplishmentsBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                accomplishments: '<',
                loadingAccomplishments: '<',
                urlFavoriteAccomplishments: '<',
                urlAllAccomplishments: '<',
            }
        });

    profileAccomplishmentsBlock.$inject = ['context', '$scope'];

    function profileAccomplishmentsBlock(context, $scope) {
        const vm = this;

        vm.accomplishmentsByType = [];
        vm.favoriteAccomplishments = [];

        let accomplishmentsWatcher = null;

        vm.$onInit = function () {
            accomplishmentsWatcher = $scope.$watch('vm.accomplishments', function(evt) {
                vm.accomplishmentsByType = getAccomplishmentsByType(vm.accomplishments);
                vm.favoriteAccomplishments = getFavoriteAccomplishments(vm.accomplishments);
            }, true);
        };

        vm.$onDestroy = function () {
            if (accomplishmentsWatcher) {
                accomplishmentsWatcher();
            }
        };

        function getAccomplishmentsByType(accomplishments) {
            if (!_.isEmpty(accomplishments)) {
                return _.groupBy(accomplishments, 'type.label');
            }

            return [];
        }

        function getFavoriteAccomplishments(accomplishments) {
            const subResearchEntity = context.getSubResearchEntity();
            if (!_.isEmpty(accomplishments)) {
                return accomplishments.filter(accomplishment => {
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