(function () {
    angular.module('app', [
        /* Shared modules */
        'ngZone',
        'app.core',
        'auth',
        'components',
        'ui.bootstrap',
        'ui-notification',
        'ui.sortable',
        'LocalStorageModule',
        'scientilla-form',
        'color.picker',
        'iso-3166-country-codes',
        'textAngular',
        'ngCookies',

        /* Feature areas */
        'errors',
        'users',
        'documents',
        'services',
        'wizard',
        'admin',
        'summary',
        'profile',
        'accomplishments',
        'documentation',
        'projects',
        'patents',
        'agreements',
        'cookies',
        'trainingModules',
        'groups' // Groups module has to be last because of the routes configuration
    ]);
})();
