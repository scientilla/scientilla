(function () {
    angular.module("app")
        .filter('newLine', newLine);

    newLine.$inject = [
    ];

    function newLine() {

        return function(text) {
            return text.replace(/\n/g, '<br />');
        };
    }

})();
