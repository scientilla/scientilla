(function () {
    "use strict";
    angular.module("services").factory("SourceService", SourceService);

    SourceService.$inject = ['Restangular'];

    function SourceService(Restangular) {
        let service = {};

        /* jshint ignore:start */
        service.searchAndFilter = async (qs, term) => {
            const results = await Restangular.all('sources').getList(qs);
            const startsWithResults = results.filter(r => r.title.toLowerCase().startsWith(term));
            const containsResults = results.filter(r => !r.title.toLowerCase().startsWith(term));

            return _.concat(_.orderBy(startsWithResults, 'title', 'asc'), _.orderBy(containsResults, 'title', 'asc'));
        };
        /* jshint ignore:end */

        service.formatSource = source => {
            if (!source) return '';
            const text = [];
            text.push(source.title);
            if (source.issn) {
                text.push(`ISSN: ${source.issn}`);
            }
            if (source.eissn) {
                text.push(`EISSN: ${source.eissn}`);
            }
            if (source.scopusId) {
                text.push(`ScopusId: ${source.scopusId}`);
            }
            return text.join(' | ');
        };

        return service;
    }
})();
