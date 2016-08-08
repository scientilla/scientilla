/* global Scientilla, Promise */

(function () {
    angular
            .module('notifications')
            .controller('NotificationBrowsingController', NotificationBrowsingController);

    NotificationBrowsingController.$inject = [
        'AuthService',
        'Restangular'
    ];

    function NotificationBrowsingController(AuthService, Restangular) {

        var vm = this;
        var groups = _.map(AuthService.user.admininstratedGroups,
                function (group) {
                    return Restangular.copy(group);
                });
        vm.researchEntities = _.union([AuthService.user], groups);
    }
})();
