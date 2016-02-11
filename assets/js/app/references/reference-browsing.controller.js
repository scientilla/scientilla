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

        function createNewDocument($event) {
            var draft = researchEntity.getNewDocument();
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
                }).then(function(draft) {
                    $rootScope.$broadcast("draft.created", draft);
                });
            });
        }
        
        function editProfile($event) {
            if (researchEntity.getType() === 'user') {
                $mdDialog.show({
                        controller: "UserFormController",
                        templateUrl: "partials/user-form.html",
                        controllerAs: "vm",
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        locals: {
                            user: researchEntity.clone()
                        },
                        fullscreen: true,
                        clickOutsideToClose: true
                    });
            } 
            else {
                GroupsService.one(researchEntity.id).get({populate: ['memberships', 'administrators']})
                        .then(function(group) {
                            $mdDialog.show({
                                    controller: "GroupFormController",
                                    templateUrl: "partials/group-form.html",
                                    controllerAs: "vm",
                                    parent: angular.element(document.body),
                                    targetEvent: $event,
                                    locals: {
                                        group: group
                                    },
                                    fullscreen: true,
                                    clickOutsideToClose: true
                                });
                });
            }
        }
    }
})();
