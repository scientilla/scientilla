(function () {
    'use strict';

    angular.module('projects')
        .component('scientillaProjectDetails', {
            templateUrl: 'partials/scientilla-project-details.html',
            controller: scientillaProjectDetails,
            controllerAs: 'vm',
            bindings: {
                project: "<"
            }
        });

    scientillaProjectDetails.$inject = [];

    function scientillaProjectDetails() {
        const vm = this;

        vm.$onInit = function () {

        };
    }

})();