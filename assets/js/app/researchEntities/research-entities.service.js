(function () {
    angular.module("app").factory("ResearchEntitiesService", controller);

    controller.$inject = [
        'Restangular',
        'EventsService',
        'ModalService',
        'Notification',
        'ResearchItemService',
        'researchItemKinds',
        'researchItemLabels'
    ];

    function controller(Restangular,
                        EventsService,
                        ModalService,
                        Notification,
                        ResearchItemService,
                        researchItemKinds,
                        researchItemLabels) {
        const service = Restangular.service("researchentities");

        service.getResearchEntity = getResearchEntity;
        service.getNewItemDraft = getNewItemDraft;
        service.editDraft = editDraft;
        service.createDraft = createDraft;
        service.updateDraft = updateDraft;
        service.deleteDraft = deleteDraft;
        service.deleteDrafts = deleteDrafts;
        service.verify = verify;
        service.verifyAll = verifyAll;
        service.unverify = unverify;
        service.editAffiliations = editAffiliations;
        service.updateAuthors = updateAuthors;
        service.getAccomplishmentDrafts = getAccomplishmentDrafts;
        service.getAccomplishments = getAccomplishments;
        service.setVerifyPrivacy = setVerifyPrivacy;
        service.setVerifyFavorite = setVerifyFavorite;


        const accomplishmentPopulates = ['type', 'authors', 'affiliations', 'institutes', 'verified', 'source', 'verifiedUsers', 'verifiedGroups'];


        /* jshint ignore:start */

        async function getResearchEntity(researchEntityId) {
            const populate = {populate: ['user', 'group']};
            return service.one(researchEntityId).get(populate);
        }

        function getNewItemDraft(researchEntity, type) {
            return {
                draftCreator: researchEntity.id,
                kind: researchItemKinds.DRAFT,
                type: type
            };
        }

        async function createDraft(researchEntity, draftData) {
            try {
                const draft = await researchEntity.all('researchItemDrafts').post(draftData);
                EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_CREATED, draftData);
                return draft;
            } catch (e) {
                console.error(e);
            }
        }

        async function updateDraft(researchEntity, draft) {
            try {
                await researchEntity.one('researchItemDrafts', draft.id).customPUT(draft);
                EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_UPDATED, draft);
            } catch (e) {
                console.error(e);
            }
        }

        async function deleteDraft(researchEntity, draft) {
            const res = await ModalService.multipleChoiceConfirm(
                'Delete',
                'This action will permanently delete this item.\n Do you want to proceed?',
                ['Proceed'],
                'Cancel',
                true);

            if (res === 0) {
                try {
                    const deletedDraft = await researchEntity.one('researchItemDrafts', draft.id).remove();

                    Notification.success("Draft deleted");
                    EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_DELETED, deletedDraft);
                } catch (e) {
                    Notification.warning("Failed to delete draft");
                    console.error(e);
                }
            }
        }

        async function deleteDrafts(researchEntity, drafts) {
            const draftIds = drafts.map(d => d.id);
            try {
                const results = await researchEntity.all('researchItemDrafts').customPUT({draftIds: draftIds}, 'delete');
                Notification.success(results.length + " draft(s) deleted");
                EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_DELETED, results);
            } catch (err) {
                Notification.warning("An error happened");
            }
        }

        async function verify(category, researchEntity, researchItem) {
            if (researchEntity.type === 'group')
                await verifyResearchItem(researchEntity, researchItem, {}, true);
            else
                await ModalService.openScientillaResearchItemVerificationForm(researchItem,
                    (verificationData) => verifyResearchItem(researchEntity, researchItem, verificationData, true),
                    category);
        }

        async function verifyAll(researchEntity, researchItems) {
            const itemIds = researchItems.map(ri => ri.id);
            const res = await verifyAllResearchItem(researchEntity, itemIds);

            const success = res.filter(r => r.success);
            const failed = res.filter(r => !r.success);

            if (success.length > 0) {
                if (success.find(r => r.researchItem.kind === researchItemKinds.DRAFT))
                    EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_VERIFIED, res);
                if (success.find(r => r.researchItem.kind === researchItemKinds.VERIFIED))
                    EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_DELETED, res);

                Notification.success(success.length + " item(s) verified");
            }
            if (failed.length > 0)
                Notification.warning(failed.length + " item(s) not verified: \n" + failed.map(f => f.message).join('\n'));


        }

        async function unverify(researchEntity, researchItem) {
            ResearchItemService.addLabel(researchItem, researchItemLabels.UVERIFYING);

            const buttonIndex = await ModalService.multipleChoiceConfirm('Unverifying',
                'Unverifying an item removes it from your profile, you can choose:\n\n' +
                'Move to drafts: to move the item in your drafts.\n' +
                'Remove: to remove it completely from your profile.',
                ['Move to drafts', 'Remove'],
                'Cancel',
                true);
            try {
                switch (buttonIndex) {
                    case -1: //cancel
                        ResearchItemService.removeLabel(researchItem, researchItemLabels.UVERIFYING);
                        return;
                    case 0: // Move to drafts
                        await copyResearchItem(researchEntity, researchItem.id);
                        EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_CREATED, {});
                        break;
                    case 1: // Remove
                        break;
                }

                try {
                    await unverifyResearchItem(researchEntity, researchItem.id);
                    EventsService.publish(EventsService.RESEARCH_ITEM_UNVERIFIED, {});
                    Notification.success("Item succesfully unverified");
                } catch (e) {
                    Notification.warning("Failed to unverify");
                }
            } catch (e) {
                ResearchItemService.removeLabel(researchItem, researchItemLabels.UVERIFYING);
            }
        }

        async function getAccomplishments(researchEntity, query) {
            const populate = {populate: accomplishmentPopulates};
            const q = _.merge({}, query, populate);
            return await researchEntity.getList('accomplishments', q);
        }

        async function getAccomplishmentDrafts(researchEntity, query) {
            const populate = {populate: accomplishmentPopulates};
            const q = _.defaultsDeep({}, query, populate);
            return await researchEntity.getList('accomplishmentDrafts', q);
        }

        async function editDraft(researchEntity, researchItem, category) {
            return ModalService.openScientillaResearchItemForm(researchEntity, _.cloneDeep(researchItem), category);
        }

        async function editAffiliations(researchEntity, researchItem) {
            return ModalService.openScientillaResearchItemAffiliationForm(researchEntity, researchItem);
        }

        async function verifyResearchItem(researchEntity, researchItem, verificationData, notifications) {
            try {
                const res = await researchEntity.one('researchitems', researchItem.id)
                    .customPUT(verificationData, 'verified');

                if (!res.success)
                    return Notification.warning(res.message);

                if (notifications)
                    Notification.success("Item verified");

                if (researchItem.kind === researchItemKinds.DRAFT)
                    EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_VERIFIED, res);
                else
                    EventsService.publish(EventsService.RESEARCH_ITEM_VERIFIED, res);

            } catch (error) {
                Notification.warning(error.data.message);
            }

        }

        async function verifyAllResearchItem(researchEntity, itemIds) {
            try {
                const res = await researchEntity.all('researchitems').customPUT({itemIds}, 'verified');

                if (res.error)
                    return Notification.warning(res.error);

                return res;

            } catch (error) {
                Notification.warning(error);
            }

        }

        async function unverifyResearchItem(researchEntity, researchItemId) {
            return researchEntity.one('researchitems', researchItemId).customPUT({}, 'unverified');
        }

        async function copyResearchItem(researchEntity, researchItemId) {
            return researchEntity.customPOST({researchItemId}, 'copy-research-item');
        }


        async function setVerifyPrivacy(researchEntity, researchItem, verify) {
            try {
                await researchEntity.one('researchitems', researchItem.id)
                    .customPUT({public: verify.public}, 'public');
                Notification.success('Privacy updated');
            } catch (e) {
                console.error(e);
                verify.public = !verify.public;
                Notification.warning('Failed to update privacy');
            }
        }

        async function setVerifyFavorite(researchEntity, researchItem, verify) {
            try {
                await researchEntity.one('researchitems', researchItem.id)
                    .customPUT({favorite: verify.favorite}, 'favorite');
                Notification.success('Favorite updated');
            } catch (e) {
                console.error(e);
                verify.favorite = !verify.favorite;
                Notification.warning('Failed to update favorite');
            }
        }

        async function updateAuthors(researchEntity, researchItem, authorsData) {
            try {
                await researchEntity.one('researchitemdrafts', researchItem.id).customPUT(authorsData, 'authors');
                EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_UPDATED, researchItem);
            } catch (e) {
                console.error(e);
                Notification.warning('Failed to update affiliations');
            }
        }

        /* jshint ignore:end */

        return service;
    }
}());