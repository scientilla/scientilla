/* global angular */
(function () {
    angular.module("app").factory("ProjectService", controller);

    controller.$inject = ['ResearchEntitiesService', '$http'];

    function controller(ResearchEntitiesService, $http) {

        return {
            get: ResearchEntitiesService.getProjects,
            exportDownload
        };

        function exportDownload(projects, format = 'csv') {
            const filename = 'Projects_Export.csv';
            $http.post('/api/v1/projects/export', {
                format: format,
                projectIds: projects.map(d => d.id)
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