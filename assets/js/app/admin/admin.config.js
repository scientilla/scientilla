(function () {
    angular
        .module('admin')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/sources", {
                redirectTo: '/sources/source'
            })
            .when("/sources/source", {
                template: `<scientilla-admin-sources
                    active-tab="source"></scientilla-admin-sources>`
            })
            .when("/sources/metrics-import", {
                template: `<scientilla-admin-sources
                    active-tab="metrics-import"></scientilla-admin-sources>`
            })
            .when("/tools", {
                redirectTo: '/tools/log-viewer'
            })
            .when("/tools/log-viewer", {
                template: `<scientilla-admin-tools
                    active-tab="log-viewer"></scientilla-admin-tools>`
            })
            .when("/tools/status", {
                template: `<scientilla-admin-tools
                    active-tab="status"></scientilla-admin-tools>`
            })
            .when("/tools/backup", {
                template: `<scientilla-admin-tools
                    active-tab="backup"></scientilla-admin-tools>`
            })
            .when("/tools/institutes", {
                template: `<scientilla-admin-tools
                    active-tab="institutes"></scientilla-admin-tools>`
            })
            .when("/tools/role-association", {
                template: `<scientilla-admin-tools
                    active-tab="role-association"></scientilla-admin-tools>`
            })
            .when("/tools/cid-association", {
                template: `<scientilla-admin-tools
                    active-tab="cid-association"></scientilla-admin-tools>`
            })
            .when("/tools/group-overview", {
                template: `<scientilla-admin-tools
                    active-tab="group-overview"></scientilla-admin-tools>`
            })
            .when("/phd-management", {
                template: '<scientilla-admin-phd-thesis></scientilla-admin-phd-thesis>'
            })
            .when("/connectors", {
                template: '<scientilla-admin-external-connectors></scientilla-admin-external-connectors>'
            })
            .when("/customize", {
                template: '<scientilla-admin-customize></scientilla-admin-customize>'
            });

    }

})();
