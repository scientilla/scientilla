(function () {
    angular.module('app', [
        /* Shared modules */
        'app.core',
        'auth',
        'components',
        'ui.bootstrap',
        'ui-notification',
        'LocalStorageModule',
        'scientilla-form',

        /* Feature areas */
        'users',
        'documents',
        'groups',
        'services',
        'wizard',
        'admin',
        'summary',
        'accomplishments'
    ]);
})();