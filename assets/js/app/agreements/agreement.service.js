/* global angular */
(function () {
    angular.module("app").factory("AgreementService", controller);

    controller.$inject = ['ResearchEntitiesService', '$http', 'ModalService'];

    function controller(ResearchEntitiesService, $http, ModalService) {

        return {
            edit: (researchEntity, draft) => ModalService.openAgreementForm(researchEntity, _.cloneDeep(draft)),
            exportDownload
        };

        function exportDownload(agreements, format = 'csv') {
            const filename = 'Agreement_Export.csv';
            $http.post('/api/v1/agreements/export', {
                format: format,
                agreementIds: agreements.map(d => d.id)
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