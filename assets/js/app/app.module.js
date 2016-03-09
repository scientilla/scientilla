(function () {
    angular.module('app', [
        /* Shared modules */
        'app.core',
        'auth',
        'components',
        'ui.bootstrap',
        'LocalStorageModule',

        /* Feature areas */
        'users',
        'references',
        'groups',
        'notifications'
    ]);
})();

