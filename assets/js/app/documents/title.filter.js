(function () {
    angular.module("references")
            .filter('title', title);
    
    title.$inject = ['$sce', 'AuthService'];

    function title($sce, AuthService) {

        function getTitle(reference) {
            var title = reference.title;
            var titleStr = title ? title : '<i> < No title > </i>'
            return titleStr;
        }

        return getTitle;
    }

})();