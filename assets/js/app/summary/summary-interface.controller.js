(function () {
    angular
        .module('summary')
        .controller('SummaryInterfaceController', controller);

    controller.$inject = ['ChartService'];

    /* jshint ignore:start */
    function controller(ChartService) {
        const vm = this;

        vm.getChartsData = getChartsData;

        async function getChartsData(researchEntity, refresh = (researchEntity.type !== 'Institute')) {
            const res = await ChartService.getData(researchEntity, [
                'journalsByYear',
                'conferencesByYear',
                'booksByYear',
                'bookSeriesByYear',
                'disseminationTalksByYear',
                'scientificTalksByYear',
                'documentsByType',
                'filteredAffiliatedJournalsByYear',
                'filteredAffiliatedConferencesByYear',
                'filteredAffiliatedBooksByYear',
                'filteredAffiliatedBookSeriesByYear',
                'filteredNotAffiliatedJournalsByYear',
                'filteredNotAffiliatedConferencesByYear',
                'filteredNotAffiliatedBooksByYear',
                'filteredNotAffiliatedBookSeriesByYear',
                'hindexPerYear',
                'citationsPerYear',
                'citationsPerDocumentYear',
                'totalIfPerYear',
                'totalSjrPerYear',
                'totalSnipPerYear',
                'chartDataDate'
            ], refresh);
            return res[0];
        }
    }

    /* jshint ignore:end */
})();
