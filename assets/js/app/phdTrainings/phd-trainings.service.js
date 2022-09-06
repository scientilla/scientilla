/* global angular */
(function () {
    angular.module("phdTrainings").factory("PhdTrainingService", controller);

    controller.$inject = ['ResearchEntitiesService', '$http'];

    function controller(ResearchEntitiesService, $http) {

        return {
            get: ResearchEntitiesService.getPhdTrainings,
            getSuggested: ResearchEntitiesService.getSuggestedPhdTrainings,
            getDiscarded: ResearchEntitiesService.getDiscardedPhdTrainings,
            exportDownload,
        };

        function exportDownload(patents, format = 'csv') {
            const filename = 'Phd_Trainings_Export.csv';
            $http.post('/api/v1/phd-trainings/export', {
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
