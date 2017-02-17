(function () {
    angular
        .module('documents')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/suggested", {
                template: params => '<scientilla-suggested-documents></scientilla-suggested-documents>'
            })
            .when("/verified", {
                template: params => '<scientilla-documents-list editable="true"></scientilla-documents-list>'
            })
            .when("/drafts", {
                template: params => '<scientilla-drafts-list></scientilla-drafts-list>'
            })
            .when("/external", {
                template: params => '<scientilla-external-documents></scientilla-external-documents>'
            });
    }

})();
