/* global angular */
(function () {
    angular.module("patents").factory("PatentService", controller);

    controller.$inject = [
        'ResearchEntitiesService',
        '$http',
        'context'
    ];

    function controller(
        ResearchEntitiesService,
        $http,
        context
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
            const filename = 'Patents_Export.csv';
            $http.post('/api/v1/patents/export', {
                format: format,
                patentIds: patents.map(d => d.id)
            }).then((res) => {
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/csv;charset=UTF-8,' + encodeURIComponent(res.data));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
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
