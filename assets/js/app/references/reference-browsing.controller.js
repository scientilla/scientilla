(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'researchEntity',
        'ContextService',
        '$uibModal',
        'ModalService',
        'GroupsService'
    ];

    function ReferenceBrowsingController(researchEntity, ContextService, $uibModal, ModalService, GroupsService) {
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
            var draft = vm.researchEntity.getNewDocument(type);

            ModalService.openScientillaDocumentForm(draft, vm.researchEntity);
        }

        function editProfile() {

            var modalInstance;
            if (researchEntity.getType() === 'user') {

                modalInstance = ModalService
                        .openScientillaUserForm(vm.researchEntity)
                        .then(function (researchEntity) {
                            vm.researchEntity = researchEntity;
                        });
            } else {
                GroupsService
                        .one(researchEntity.id)
                        .get({populate: ['memberships', 'administrators']})
                        .then(ModalService.openScientillaGroupForm)
                        .then(function (researchEntity) {
                            vm.researchEntity = researchEntity;
                        });


            }
            /*modalInstance
             .then(function (researchEntity) {
             vm.researchEntity = researchEntity;
             });*/
        }
    }
})();
