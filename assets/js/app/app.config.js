(function () {
    angular
            .module('app')
            .config(configure)
            .run(run);

    configure.$inject = ['RestangularProvider', '$routeProvider'];

    function configure(RestangularProvider, $routeProvider) {
        $routeProvider
            .when("/home", {
                template: "",
                controller: "HomeController"
            })
            .otherwise({
                redirectTo: "/home"
            });

        //sTODO: set request error interceptor
    }

    function run($rootScope, $location, AuthService, Restangular) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if (!AuthService.isLogged) {
                if (next.access && next.access.noLogin) {

                }
                else {
                    $location.path("/login");
                }
            }
        });

        Restangular.extendModel('users', function (user) {
            _.assign(user, Scientilla.user);
            return user;
        });

        Restangular.extendModel('references', function (reference) {
            //sTODO: refactor
            _.assign(reference, Scientilla.reference);
            if (reference.owner)
                _.assign(reference.owner, Scientilla.user);
            _.forEach(reference.collaborators, function(c) {
                _.assign(c, Scientilla.user);
            });

            return reference;
        });
        
        Restangular.extendModel('groups', function (group) {
            //sTODO: refactor
//            _.assign(reference, Scientilla.group);
            _.forEach(group.memberships, function(m) {
                _.defaults(m, Scientilla.membership);
                _.defaults(m.user, Scientilla.user);
            });
            _.forEach(group.administrators, function(a) {
                _.defaults(a, Scientilla.user);
            });

            return group;
        });
    }
})();
