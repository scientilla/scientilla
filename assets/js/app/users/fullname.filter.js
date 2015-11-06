(function () {
    angular.module("users")
            .filter('fullname', function () {

                function getUsername(user) {
                    var name = user.name ? user.name : "";
                    var surname = user.surname ? user.surname : "";
                    var fullName = _.trim(name + " " + surname);
                    return fullName;
                }

                return getUsername;
            });

})();
