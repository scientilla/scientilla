/* global angular */
(function () {
    angular.module("agreements").factory("AgreementService", controller);

    controller.$inject = [
        '$http',
        'DownloadService'
    ];

    function controller($http, DownloadService) {
        const service = {};

        service.getStatus = agreement => {
            let status = '';

            if (_.has(agreement, 'startDate') && (moment(agreement.startDate).isBefore(moment()) || moment(agreement.startDate).isSame(moment(), 'day'))) {
                status = 'active';
            }

            if (_.has(agreement, 'endDate') && moment(agreement.endDate).isBefore(moment())) {
                status = 'ended';
            }

            return status;
        };

        service.exportDownload = (items, url, format) => {
            $http.post(url, {
                format: format,
                projectIds: items.map(d => d.id)
            }, {responseType: 'arraybuffer'})
                .then((res) => {
                    DownloadService.download(res.data, 'agreements', format);
                });
        };

        return service;
    }
})();
