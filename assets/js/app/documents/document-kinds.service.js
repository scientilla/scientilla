(function () {

    angular.module("documents").factory("DocumentKinds", DocumentKinds);

    function DocumentKinds() {
        return {
            DRAFT: 'd',
            VERIFIED: 'v',
            EXTERNAL: 'e',
            IGNORED: 'i'
        };
    }
})();