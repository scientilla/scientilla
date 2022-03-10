/* global angular */
(function () {
    angular.module("agreements").factory("AgreementService", controller);

    controller.$inject = [];

    function controller() {
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

        return service;
    }
})();
