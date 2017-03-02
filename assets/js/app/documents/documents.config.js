(function () {
    angular
        .module('documents')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/suggested", {
                template: params => '' +
                '<scientilla-suggested-documents research-entity="$resolve.researchEntity">' +
                '</scientilla-suggested-documents>',
                resolve: {researchEntity: getResearchEntity}
            })
            .when("/verified", {
                template: params => '' +
                '<scientilla-documents-list research-entity="$resolve.researchEntity" editable="true">' +
                '</scientilla-documents-list>',
                resolve: {researchEntity: getResearchEntity}
            })
            .when("/drafts", {
                template: params => '' +
                '<scientilla-drafts-list research-entity="$resolve.researchEntity">' +
                '</scientilla-drafts-list>',
                resolve: {researchEntity: getResearchEntity}
            })
            .when("/external", {
                template: params => '' +
                '<scientilla-external-documents research-entity="$resolve.researchEntity">' +
                '</scientilla-external-documents>',
                resolve: {researchEntity: getResearchEntity}
            });

        getResearchEntity.$inject = ['context'];

        function getResearchEntity(context) {
            return context.getResearchEntity();
        }
    }

})();
