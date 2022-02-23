(function () {
    angular.module("admin").factory("AdminService", AdminService);

    AdminService.$inject = [
      'Restangular'
    ];

    function AdminService(Restangular) {
        const service = {};

        /* jshint ignore:start */
        service.getInstitutes = async () => {
            const result = await Restangular.one('phdInstitutes').get();

            if (result && _.has(result, 'items')) {
                return _.orderBy(result.items, [institute => institute.name.toLowerCase()], 'name', 'asc');
            }

            return [];
        };

        service.getCourses = async institute => {
            const result = await Restangular.one('phdCourses').get({
                where: {
                    institute: institute.id
                }
            });

            if (result && _.has(result, 'items')) {
                return _.orderBy(result.items, [course => course.name.toLowerCase()], 'name', 'asc');
            }

            return [];
        };

        service.getCycles = async course => {
            const result = await Restangular.one('phdCycles').get({
                where: {
                    course: course.id
                }
            });

            if (result && _.has(result, 'items')) {
                return _.orderBy(result.items, [cycle => cycle.name.toLowerCase()], 'name', 'asc');
            }

            return [];
        };
        /* jshint ignore:end */

        return service;
    }
}());
