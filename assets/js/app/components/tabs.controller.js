(function () {
    angular
        .module('components')
        .controller('TabsController', controller);

    controller.$inject = ['$scope', '$location'];

    function controller($scope, $location) {
        const vm = this;

        vm.initializeTabs = initializeTabs;
        vm.registerTab = registerTab;
        vm.unregisterTab = unregisterTab;
        vm.reloadTabs = reloadTabs;

        vm.tabIdentifiers = [];
        vm.registeredTabs = [];
        vm.activeTabIndentifier = null;

        function initializeTabs(tabIdentifiers) {
            vm.tabIdentifiers = tabIdentifiers;

            /* jshint ignore:start */
            $scope.$watch('vm.activeTabIndex', async (newValue, oldValue) => {
                // Only continue when value has changed
                if (newValue !== oldValue) {
                    // Get tab info about old and new tab
                    const oldIdentifier = vm.tabIdentifiers.find(identifier => identifier.index === oldValue);
                    vm.activeTabIdentifier = vm.tabIdentifiers.find(identifier => identifier.index === newValue);

                    // Exit if the old or new tab is not been found
                    if (!vm.activeTabIdentifier || !oldIdentifier) {
                        return;
                    }

                    // Store path
                    let path = $location.path();

                    // If the slug is inside the path
                    if (!_.isNil(oldIdentifier)) {
                        // Create regex to test exact the old slug
                        const regexOldSlug = new RegExp('\\b' + oldIdentifier.slug + '\\b');

                        // Test if the slug exists in the current path
                        if (regexOldSlug.test(path)) {
                            // Replace the slug of the old tab with the one of the new path
                            path = path.replace(regexOldSlug, vm.activeTabIdentifier.slug);
                        } else {
                            return;
                        }
                    }

                    // Set the new URL without reloading the page
                    $location.url(path, false);

                    // Get the active tab
                    const activeRegisteredTab = vm.registeredTabs.find(
                        tab => tab.name === vm.activeTabIdentifier.tabName
                    );

                    // Set the variable reloaded to false
                    if (_.has(activeRegisteredTab, 'reloaded')) {
                        activeRegisteredTab.reloaded = false;
                    }

                    // Call the handleLoadTab function to reload the tab
                    handleLoadTab();
                }
            }, true);
            /* jshint ignore:end */

            if (!_.isUndefined($scope.vm.activeTab) && _.has(vm.tabIdentifiers, $scope.vm.activeTab)) {
                vm.activeTabIdentifier = vm.tabIdentifiers.find(identifier => identifier.index === $scope.vm.activeTab);
            } else {
                const path = $location.path().split('/');
                vm.activeTabIdentifier = vm.tabIdentifiers.find(identifier => _.indexOf(path, identifier.slug) >= 0);
            }

            if (!vm.activeTabIdentifier) {
                vm.activeTabIdentifier = _.first(vm.tabIdentifiers);
            }

            if (_.has(vm.activeTabIdentifier, 'index')) {
                $scope.vm.activeTabIndex = parseInt(vm.activeTabIdentifier.index);
            }

            handleLoadTab();
        }

        function reloadTabs(data) {
            vm.registeredTabs.forEach(t => t.reload(data));
        }

        /*
         * Push the tab to the registeredTabs array with defaults
         */
        function registerTab(tab) {
            tab.reloaded = false;
            tab.loading = false;
            vm.registeredTabs.push(tab);
            handleLoadTab();
        }

        function unregisterTab(tab) {
            _.remove(vm.registeredTabs, tab);
        }

        /* jshint ignore:start */
        async function handleLoadTab() {
            // Check if the active tab is set and is has a tabName property
            if (vm.activeTabIdentifier && _.has(vm.activeTabIdentifier, 'tabName')) {
                // Find the registeredTab with the same name
                const activeRegisteredTab = vm.registeredTabs.find(tab => tab.name === vm.activeTabIdentifier.tabName);
                // Check if the active tab is been registered,
                // if it should be reloaded,
                // if it's not reloading and
                // if it's not been reloaded
                if (
                    activeRegisteredTab &&
                    activeRegisteredTab.shouldBeReloaded &&
                    !activeRegisteredTab.loading &&
                    !activeRegisteredTab.reloaded
                ) {
                    // Set the loading th true
                    activeRegisteredTab.loading = true;

                    // Check if it has a getData property and it is a function
                    if (_.has(activeRegisteredTab, 'getData') && typeof activeRegisteredTab.getData === 'function') {
                        // Wait for the new data
                        const data = await activeRegisteredTab.getData();
                        // Reload the tab with the new data
                        activeRegisteredTab.reload(data);
                        activeRegisteredTab.loading = false;
                        activeRegisteredTab.reloaded = true;
                    } else {
                        // Reload the tab
                        activeRegisteredTab.reload();
                        activeRegisteredTab.loading = false;
                        activeRegisteredTab.reloaded = true;
                    }
                }
            }
        }
        /* jshint ignore:end */
    }
})();
