/* global angular */
(function () {
    angular.module("app").factory("PatentService", controller);

    controller.$inject = ['ResearchEntitiesService', '$http'];

    function controller(ResearchEntitiesService, $http) {

        return {
            get: ResearchEntitiesService.getPatents,
            getFamilies: ResearchEntitiesService.getPatentFamilies,
            exportDownload
        };

        function exportDownload(patents, format = 'csv') {
            const filename = 'Patents_Export.csv';
            $http.post('/api/v1/patents/export', {
                format: format,
                patentIds: patents.map(d => d.id)
            }).then((res) => {
                const element = document.createElement('a');
                element.setAttribute('href', encodeURI(res.data));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            });
        }
    }
})();