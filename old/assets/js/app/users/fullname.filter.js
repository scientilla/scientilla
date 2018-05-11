(function () {
    angular.module("users")
            .filter('fullname', function () {

                function getUsername(user) {
                    
                    if(_.isFunction(user.getDisplayName))
                        return user.getDisplayName();
                    else
                        return '';
                }

                return getUsername;
            });

})();
