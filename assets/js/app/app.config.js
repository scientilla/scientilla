(function () {
    angular
            .module('app')
            .config(configure)
            .run(run);

    configure.$inject = ['RestangularProvider', '$routeProvider', 'localStorageServiceProvider'];

    function configure(RestangularProvider, $routeProvider, localStorageServiceProvider) {
        $routeProvider
                .when("/", {
                    template: "",
                    controller: "HomeController"
                })
                .otherwise({
                    redirectTo: "/"
                });

        //sTODO: set request error interceptor

        localStorageServiceProvider
                .setPrefix('scientilla');
    }

    run.$inject = ['$rootScope', '$location', 'AuthService', 'Restangular'];

    function run($rootScope, $location, AuthService, Restangular) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if (!AuthService.isLogged) {
                if (next.access && next.access.noLogin) {

                } else {
                    $location.path("/login");
                }
            }
        });

        Restangular.extendModel('users', function (user) {
            _.assign(user, Scientilla.user);
            _.forEach(user.collaborations, function (c) {
                _.defaults(c, Scientilla.collaboration);
                _.defaults(c.group, Scientilla.group);
            });
            _.forEach(user.references, function (r) {
                _.defaults(r, Scientilla.reference);
                _.forEach(r.privateCoauthors, function (c) {
                    _.assign(c, Scientilla.user);
                });
                _.forEach(r.publicCoauthors, function (c) {
                    _.assign(c, Scientilla.user);
                });
            });
//            user.references = Restangular.restangularizeCollection(null, user.references, 'references');
            return user;
        });

        Restangular.extendModel('references', function (reference) {
            //sTODO: refactor
            _.assign(reference, Scientilla.reference);
            if (reference.draftCreator)
                _.assign(reference.draftCreator, Scientilla.user);
            if (reference.draftGroupCreator)
                _.assign(reference.draftGroupCreator, Scientilla.group);
            _.forEach(reference.privateCoauthors, function (c) {
                _.assign(c, Scientilla.user);
            });
            _.forEach(reference.publicCoauthors, function (c) {
                _.assign(c, Scientilla.user);
            });

            return reference;
        });

        Restangular.extendModel('groups', function (group) {
            //sTODO: refactor
            _.assign(group, Scientilla.group);
            _.forEach(group.memberships, function (m) {
                _.defaults(m, Scientilla.membership);
                _.defaults(m.user, Scientilla.user);
            });
            _.forEach(group.administrators, function (a) {
                _.defaults(a, Scientilla.user);
            });
            _.forEach(group.references, function (r) {
                _.defaults(r, Scientilla.reference);
                _.forEach(r.privateCoauthors, function (c) {
                    _.assign(c, Scientilla.user);
                });
                _.forEach(r.publicCoauthors, function (c) {
                    _.assign(c, Scientilla.user);
                });
            });
//            group.references = Restangular.restangularizeCollection(null, group.references, 'references');

            return group;
        });
//        Restangular.extendModel('collaborations', function (collaboration) {
//            return collaboration;
//        });
    }
})();
