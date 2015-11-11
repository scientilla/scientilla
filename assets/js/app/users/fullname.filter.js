(function () {
    angular.module("users")
            .filter('fullname', function () {

                function getUsername(user) {
                    return user.getDisplayName();
                }

                return getUsername;
            });

})();
