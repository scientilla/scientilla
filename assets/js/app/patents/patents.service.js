/* global angular */
(function () {
    angular.module("patents").factory("PatentService", controller);

    controller.$inject = [
        'ResearchEntitiesService',
        '$http',
        'context',
        'DownloadService'
    ];

    function controller(
        ResearchEntitiesService,
        $http,
        context,
        DownloadService
    ) {

        return {
            get: ResearchEntitiesService.getPatents,
            getFamilies: ResearchEntitiesService.getPatentFamilies,
            getSuggested: ResearchEntitiesService.getSuggestedPatents,
            getDiscarded: ResearchEntitiesService.getDiscardedPatents,
            discard: ResearchEntitiesService.discard,
            multipleDiscard: ResearchEntitiesService.multipleDiscard,
            verify,
            multipleVerify: ResearchEntitiesService.multipleVerify,
            unverify: ResearchEntitiesService.unverify,
            exportDownload,
            handleQuery
        };

        /* jshint ignore:start */
        async function verify(researchEntity, researchItem) {
            const completeResearchItem = await ResearchEntitiesService.getPatent(researchItem.id);
            await ResearchEntitiesService.verify('patent', researchEntity, completeResearchItem);

            if (researchEntity.type === 'user') {
                await context.refreshSubResearchEntity();
            }
        }

        /* jshint ignore:end */

        function exportDownload(patents, format = 'csv') {
            $http.post('/api/v1/patents/export', {
                format: format,
                patentIds: patents.map(d => d.id)
            }, {responseType: 'arraybuffer'})
                .then((res) => {
                    DownloadService.download(res.data, 'patents', format);
                });
        }

        function handleQuery(query) {
            if (!_.has(query, 'where.type')) {
                return;
            }

            switch (true) {
                case query.where.type === 'prosecutions':
                    query.where.translation = false;
                    query.where.priority = false;
                    break;
                case query.where.type === 'priorities':
                    query.where.translation = false;
                    query.where.priority = true;
                    break;
                case query.where.type === 'all' && _.has(query, 'where.translation') && query.where.translation:
                    delete query.where.translation;
                    delete query.where.priority;
                    break;
                case query.where.type === 'all' && (
                    !_.has(query, 'where.translation') ||
                    (
                        _.has(query, 'where.translation') &&
                        !query.where.translation
                    )
                ):
                    query.where.translation = false;
                    delete query.where.priority;
                    break;
                default:
                    break;
            }

            delete query.where.type;

            return query;
        }
    }
})();
