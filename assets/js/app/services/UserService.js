(function () {
    "use strict";
    angular.module("services").factory("UserService", UserService);

    UserService.$inject = [];

    function UserService() {
        let service = {};

        service.getAlias = (user) => {
            function capitalizeAll(str, wordSeparators) {
                function capitalize(str) {
                    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
                }

                let retStr = str.toLocaleLowerCase();
                for (const c of wordSeparators) {
                    retStr = retStr.split(c).map(capitalize).join(c);
                }

                return retStr;
            }

            const separators = [' ', '-', '.'];
            const nameInitials = user.name.split(' ').map(n => n[0]).join('.') + '.';

            return capitalizeAll(user.surname + ' ' + nameInitials, separators);
        };

        return service;
    }
})();