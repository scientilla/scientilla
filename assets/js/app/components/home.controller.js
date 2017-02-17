(function () {
    angular
            .module('components')
            .controller('HomeController', HomeController);

    HomeController.$inject = ['AuthService', '$location'];

    function HomeController(AuthService, $location) {
        activate();

        function activate() {
            var homeUrl = '/suggested';
            $location.path(homeUrl);
        }
    }
})();
