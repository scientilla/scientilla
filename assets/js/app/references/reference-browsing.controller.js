(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'researchEntity',
        'ContextService',
        '$mdDialog',
        '$rootScope',
        'GroupsService'
    ];

    function ReferenceBrowsingController(researchEntity, ContextService, $mdDialog, $rootScope, GroupsService) {
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

        function createNewDocument($event, type) {
            var draft = researchEntity.getNewDocument(type);
            researchEntity.all('drafts').post(draft).then(function (draft) {
                $mdDialog.show({
                    controller: "ReferenceFormController",
                    templateUrl: "partials/reference-form.html",
                    controllerAs: "vm",
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    locals: {
                        document: draft.clone()
                    },
                    fullscreen: true,
                    clickOutsideToClose: true
                }).then(function (draft) {
                    $rootScope.$broadcast("draft.created", draft);
                });
            });
        }

        function editProfile($event) {
            var getDialog;
            if (researchEntity.getType() === 'user') {
                getDialog = $mdDialog.show({
                    controller: "UserFormController",
                    templateUrl: "partials/user-form.html",
                    controllerAs: "vm",
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    locals: {
                        user: vm.researchEntity.clone()
                    },
                    fullscreen: true,
                    clickOutsideToClose: true
                });
            } else {
                getDialog = $mdDialog.show({
                    controller: "GroupFormController",
                    templateUrl: "partials/group-form.html",
                    controllerAs: "vm",
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    locals: {
                        group: GroupsService.one(researchEntity.id).get({populate: ['memberships', 'administrators']})
                    },
                    fullscreen: true,
                    clickOutsideToClose: true
                });
            }
            getDialog
                    .then(function (researchEntity) {
                        vm.researchEntity = researchEntity;
                    });
        }
    }
})();
