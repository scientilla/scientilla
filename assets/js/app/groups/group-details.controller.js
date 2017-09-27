(function () {
    angular
        .module('groups')
        .controller('GroupDetailsController', GroupDetailsController);

    GroupDetailsController.$inject = [
        'group',
        'documentListSections'
    ];

    function GroupDetailsController(group, documentListSections) {
        var vm = this;
        vm.group = group;
        vm.documentListSections = documentListSections;

        activate();

        function activate() {
            if (!vm.group.id)
                return;
        }

    }
})();
