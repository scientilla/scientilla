(function () {
    angular
            .module('components')
            .controller('HomeController', HomeController);

    HomeController.$inject = ['path'];

    function HomeController(path) {
        activate();

        function activate() {
            var homeUrl = '/suggested';
            path.goTo(homeUrl);
        }
    }
})();
