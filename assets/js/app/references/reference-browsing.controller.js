(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'researchEntity',
        'ContextService',
        '$uibModal',
        '$rootScope',
        'GroupsService'
    ];

    function ReferenceBrowsingController(researchEntity, ContextService, $uibModal, $rootScope, GroupsService) {
        var vm = this;

        vm.researchEntity = researchEntity;
        ContextService.setResearchEntity(researchEntity);
        vm.editUrl = vm.researchEntity.getProfileUrl();
        vm.createNewDocument = createNewDocument;
        vm.editProfile = editProfile;
        vm.openMenu = openMenu;
        vm.types = Scientilla.reference.getDocumentTypes();

        function openMenu($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        }

        function createNewDocument(type) {
            var draft = researchEntity.getNewDocument(type);

            $uibModal.open({
                animation: true,
                templateUrl: 'partials/reference-form.html',
                controller: 'ReferenceFormController',
                controllerAs: "vm",
                resolve: {
                    document: function () {
                        return draft;
                    }
                }
            });
        }

        function editProfile() {
            
            var modalInstance;
            if (researchEntity.getType() === 'user') {
                modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/user-form.html',
                    controller: 'UserFormController',
                    controllerAs: "vm",
                    resolve: {
                        user: function () {
                            return vm.researchEntity.clone();
                        }
                    }
                });
            } else {
                modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/group-form.html',
                    controller: 'GroupFormController',
                    controllerAs: "vm",
                    resolve: {
                        group: function () {
                            return GroupsService.one(researchEntity.id).get({populate: ['memberships', 'administrators']});
                        }
                    }
                });
            }
            modalInstance
                    .result
                    .then(function (researchEntity) {
                        vm.researchEntity = researchEntity;
                    });
        }
    }
})();
