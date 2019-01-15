(function () {

    angular.module("accomplishments").factory("AccomplishmentKinds", AccomplishmentKinds);

    // Get all the kinds of an accomplishment
    function AccomplishmentKinds() {
        return {
            DRAFT: 'd',
            VERIFIED: 'v',
            EXTERNAL: 'e',
            IGNORED: 'i'
        };
    }
})();