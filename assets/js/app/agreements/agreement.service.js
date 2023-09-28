/* global angular */
(function () {
    angular.module("agreements").factory("AgreementService", controller);

    controller.$inject = [
        '$http'
    ];

    function controller($http) {
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

        service.exportDownload = (items, filename, url, format = 'csv') => {
            $http.post(url, {
                format: format,
                projectIds: items.map(d => d.id)
            }).then((res) => {
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/csv;charset=UTF-8,' + encodeURIComponent(res.data));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            });
        };

        return service;
    }
})();
