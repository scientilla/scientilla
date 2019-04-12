/* global angular */
(function () {
    angular.module("app")
        .filter('accomplishmentTitle', title);

    title.$inject = [];

    function title() {

        function getTitle(accomplishment) {
            const title = accomplishment.type.key === 'editor' ? accomplishment.medium?accomplishment.medium.title: undefined : accomplishment.title;
            return title ? title : '<i> < No title > </i>';
        }

        return getTitle;
    }

})();