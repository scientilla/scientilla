(function () {
    angular
            .module('groups')
            .controller('GroupFormController', GroupFormController);

    GroupFormController.$inject = [
        'GroupsService',
        'FormForConfiguration',
        '$scope',
        'group',
        'AuthService',
        '$location'
    ];

    function GroupFormController(GroupsService, FormForConfiguration, $scope, group, AuthService, $location) {
        var vm = this;
        vm.group = group;
        console.log(group);

        vm.validationAndViewRules = {
            name: {
                inputType: 'text',
                required: true,
                minlength: 3,
                maxlength: 40
            },
            slug: {
                inputType: 'text',
                required: true,
                minlength: 3,
                maxlength: 40,
                pattern: {
                    rule: /^[a-zA-Z0-9-_]*$/,
                    message: 'The slug must contains only letters, number and dashes'
                }
            }
        };

        vm.submit = submit;

        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();
            
            $scope.$watch('vm.group.name', nameChanged);
        }
        
        function nameChanged() {
            if (!vm.group)
                return;
            if (!vm.group.id) {
                vm.group.slug = calculateSlug(vm.group);
            }
        }
        
        function calculateSlug(group) {
            var name = group.name ? group.name : "";
            var slug = name.toLowerCase().replace(/\s+/gi, '-');
            return slug;
        }

        function submit() {
            if (_.isUndefined(vm.group.id)) {
                console.log('create new group');
                GroupsService.post(vm.group);
            }
            else
                GroupsService.put(vm.group);
        }

    }
})();