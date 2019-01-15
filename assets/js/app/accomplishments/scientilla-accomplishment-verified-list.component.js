(function () {
    'use strict';

    angular.module('accomplishments')
        .component('scientillaAccomplishmentVerifiedList', {
            templateUrl: 'partials/scientilla-accomplishment-verified-list.html',
            controller: scientillaAccomplishmentVerifiedList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    scientillaAccomplishmentVerifiedList.$inject = [
        'accomplishmentListSections'
    ];

    function scientillaAccomplishmentVerifiedList(accomplishmentListSections) {
        const vm = this;
        vm.accomplishmentListSections = accomplishmentListSections;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();