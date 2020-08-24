/* global angular */
(function () {
    angular.module("app").factory("ProjectService", controller);

    controller.$inject = ['ResearchEntitiesService'];

    function controller(ResearchEntitiesService) {

        return {
            get: ResearchEntitiesService.getProjects,
            exportDownload,
            setVerifyPrivacy,
            setVerifyFavorite
        };

        function exportDownload(accomplishments, format) {
            const filename = format === 'csv' ? 'Accomplishments_Export.csv' : 'Accomplishments_Export.bib';
            $http.post('/api/v1/accomplishments/export', {
                format: format,
                accomplishmentIds: accomplishments.map(d => d.id)
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

        function setVerifyPrivacy(verify) {
            researchEntityService
                .setVerifyPrivacy(researchEntity, verify)
                .then(() => {
                    Notification.success('Privacy updated');
                    EventsService.publish(EventsService.PROJECT_VERIFY_PRIVACY_UPDATED, document);
                })
                .catch(() => {
                    verify.public = !verify.public;
                    Notification.warning('Failed to update privacy');
                });
        }

        function setVerifyFavorite(verify) {
            researchEntityService
                .setVerifyFavorite(researchEntity, verify)
                .then(() => {
                    Notification.success('Favorite updated');
                    EventsService.publish(EventsService.PROJECT_VERIFY_FAVORITE_UPDATED, document);
                })
                .catch(() => {
                    verify.favorite = !verify.favorite;
                    Notification.warning('Failed to update favorite');
                });
        }
    }
})();