(function () {
    angular.module("app")
        .filter('valuta', valuta);

    valuta.$inject = [
    ];

    function valuta() {

        return function(valuta) {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR'
            });

            return formatter.format(valuta);
        };
    }

})();
