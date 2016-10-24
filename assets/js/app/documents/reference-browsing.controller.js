/* global Scientilla */

(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'researchEntity',
        'ContextService',
        'ModalService',
        'GroupsService',
        'UsersService',
        'DocumentTypesService'
    ];

    function ReferenceBrowsingController(researchEntity, ContextService, ModalService, GroupsService, UsersService, DocumentTypesService) {
        var vm = this;

        vm.researchEntity = researchEntity;
        ContextService.setResearchEntity(researchEntity);
        vm.createNewDocument = createNewDocument;
        vm.editProfile = editProfile;
        vm.openMenu = openMenu;
        vm.types = DocumentTypesService.getDocumentTypes();

        function openMenu($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        }

        function createNewDocument(type) {
            var draft = vm.researchEntity.getNewDocument(type);

            ModalService
                    .openScientillaDocumentForm(draft, vm.researchEntity);
        }

        function editProfile() {
            var openForm;
            var researchEntityService;
            if (researchEntity.getType() === 'user') {
                openForm = ModalService.openScientillaUserForm;
                researchEntityService = UsersService;
            }
            else {
                openForm = ModalService.openScientillaGroupForm;
                researchEntityService = GroupsService;
            }
            
            researchEntityService
                    .getProfile(researchEntity.id)
                    .then(openForm)
                    .then(function (status) {
                        if (status !== 1)
                            return vm.researchEntity;
                        return researchEntityService.getProfile(researchEntity.id);
                    })
                    .then(function (researchEntity) {
                        vm.researchEntity = researchEntity;
                    });
        }
    }
})();
