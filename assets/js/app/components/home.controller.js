(function () {
    angular
            .module('components')
            .controller('HomeController', HomeController);

    HomeController.$inject = ['AuthService', '$location'];

    function HomeController(AuthService, $location) {
        activate();

        function activate() {
            var homeUrl = '/users/' + AuthService.userId + '/references';
            $location.path(homeUrl);
        }
    }
})();
