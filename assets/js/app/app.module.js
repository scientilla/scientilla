(function () {
    angular.module('app', [
        /* Shared modules */
        'app.core',
        'auth',
        'components',

        /* Feature areas */
        'users',
        'references',
        'groups',
        'notifications',
        'external'
    ]);
})();

