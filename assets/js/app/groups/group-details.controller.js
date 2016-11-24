(function () {
    angular
            .module('groups')
            .controller('GroupDetailsController', GroupDetailsController);

    GroupDetailsController.$inject = [
        'group'
    ];

    function GroupDetailsController(group) {
        var vm = this;
        vm.group = group;

        activate();

        function activate() {
            if (!vm.group.id)
                return;
        }

    }
})();
