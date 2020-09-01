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
        'rzSlider',

        /* Feature areas */
        'users',
        'documents',
        'groups',
        'services',
        'wizard',
        'admin',
        'summary',
        'profile',
        'accomplishments',
        'documentation',
        'projects'
    ]);
})();