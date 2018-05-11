(function () {
    angular.module("documents")
            .filter('title', title);
    
    title.$inject = ['$sce', 'AuthService'];

    function title($sce, AuthService) {

        function getTitle(document) {
            var title = document.title;
            var titleStr = title ? title : '<i> < No title > </i>';
            return titleStr;
        }

        return getTitle;
    }

})();