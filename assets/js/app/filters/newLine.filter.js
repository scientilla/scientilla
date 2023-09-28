(function () {
    angular.module("app")
        .filter('newLine', newLine);

    newLine.$inject = [
    ];

    function newLine() {

        return function(text) {
            console.log(text);
            return text.replace(/\n/g, '<br />');
        };
    }

})();
