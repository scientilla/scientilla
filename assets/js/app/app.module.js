(function () {
    angular.module('app', [
        /* Shared modules */
        'ngZone',
        'app.core',
        'auth',
        'components',
        'ui.bootstrap',
        'ui-notification',
        'LocalStorageModule',
        'scientilla-form',
        'color.picker',

        /* Feature areas */
        'users',
        'documents',
        'groups',
        'services',
        'wizard',
        'admin',
        'summary'
    ]);
})();