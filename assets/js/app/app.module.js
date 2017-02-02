(function () {
    angular.module('app', [
        /* Shared modules */
        'app.core',
        'auth',
        'components',
        'ui.bootstrap',
        'ui-notification',
        'LocalStorageModule',

        /* Feature areas */
        'users',
        'documents',
        'groups',
        'notifications',
        'services'
    ]);
})();