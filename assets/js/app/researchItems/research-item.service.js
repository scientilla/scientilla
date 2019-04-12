/* global angular */
(function () {
    angular.module("app").factory("ResearchItemService", controller);

    controller.$inject = [];

    function controller() {

        return {
            addLabel,
            removeLabel,
            hasLabel,
            getUserIndex,
            isUnverifying
        };

        function addLabel(researchItem, label) {
            if (!researchItem.labels) researchItem.labels = [];
            if (!hasLabel(researchItem, label))
                researchItem.labels.push(label);
        }

        function removeLabel(researchItem, label) {
            if (!researchItem.labels) return;
            _.remove(researchItem.labels, l => l === label);
        }

        function hasLabel(researchItem, label) {
            return Array.isArray(researchItem.labels) ? researchItem.labels.includes(label) : false;
        }

        function getUserIndex(researchItem, user) {
            const authors = getAuthorsStrings(researchItem);
            const aliases = user.getAliases().map(a => a.toLocaleLowerCase());
            return _.findIndex(authors, a => aliases.includes(a));
        }

        function isUnverifying(researchItem) {
            return hasLabel(researchItem, researchItemLabels.UVERIFYING);
        }

        function getAuthorsStrings(researchItem) {
            if (!researchItem.authors) return [];
            return researchItem.authors.map(a => a.authorStr.toLocaleLowerCase());
        }
    }
})();