/* global Scientilla */

(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'context',
        'ModalService',
        'GroupsService',
        'UsersService',
        'DocumentTypesService'
    ];

    function ReferenceBrowsingController(context, ModalService, GroupsService, UsersService, DocumentTypesService) {
        var vm = this;

        vm.researchEntity = context.getResearchEntity();
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
            if (vm.researchEntity.getType() === 'user') {
                openForm = ModalService.openScientillaUserForm;
                researchEntityService = UsersService;
            }
            else {
                openForm = ModalService.openScientillaGroupForm;
                researchEntityService = GroupsService;
            }
            
            researchEntityService
                    .getProfile(vm.researchEntity.id)
                    .then(openForm)
                    .then(function (status) {
                        if (status !== 1)
                            return vm.researchEntity;
                        return researchEntityService.getProfile(vm.researchEntity.id);
                    })
                    .then(function (researchEntity) {
                        vm.researchEntity = researchEntity;
                    });
        }
    }
})();
