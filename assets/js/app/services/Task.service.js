(function () {
    "use strict";
    angular.module("services").factory("TaskService", Service);

    Service.$inject = ['Restangular'];

    function Service(Restangular) {
        return {
            /* jshint ignore:start */
            run: async command => {
                const formData = new FormData();
                formData.append('command', command);
                const res = await Restangular.one('task')
                    .customPOST(formData, '', undefined, {'Content-Type': undefined});
                return res;
            },
            isRunning: async command => {
                return await Restangular.one('task', command).get();
            }
            /* jshint ignore:end */
        };
    }
}());
