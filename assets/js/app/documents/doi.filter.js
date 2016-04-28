(function () {
    angular.module("references")
            .filter('doi', doiFilter);

    function doiFilter() {

        function getDoi(reference) {
            var doi = reference.doi;
            var titleStr = doi ? '<b>DOI:</b> <a href="http://dx.doi.org/' + doi + '" target="_blank" >' + doi + '</a>' : '';
            return titleStr;
        }

        return getDoi;
    }

})();