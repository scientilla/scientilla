(function () {
    angular.module('app', [
        /* Shared modules */
        'app.core',
        'auth',
        'components',
        'ui.bootstrap',
        'ui-notification',
        'LocalStorageModule',
        'services',

        /* Feature areas */
        'users',
        'documents',
        'groups',
        'notifications'
    ]);
})();