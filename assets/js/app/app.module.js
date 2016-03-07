(function () {
    angular.module('app', [
        /* Shared modules */
        'app.core',
        'auth',
        'components',
        'ui.bootstrap',

        /* Feature areas */
        'users',
        'references',
        'groups',
        'notifications',
        'external'
    ]);
})();

