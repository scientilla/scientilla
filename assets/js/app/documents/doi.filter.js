(function () {
    angular.module("documents")
            .filter('doi', doiFilter);

    function doiFilter() {

        function getDoi(document) {
            var doi = document.doi;
            var titleStr = doi ? '<b>DOI:</b> <a href="http://dx.doi.org/' + doi + '" target="_blank" >' + doi + '</a>' : '';
            return titleStr;
        }

        return getDoi;
    }

})();