(function () {
    angular.module("app").factory("ResearchEntitiesService", controller);

    controller.$inject = [
        'Restangular',
        'EventsService',
        'ModalService',
        'Notification',
        'ResearchItemService',
        'researchItemKinds',
        'researchItemLabels',
        'ResearchItemTypesService',
        'Prototyper'
    ];

    function controller(
        Restangular,
        EventsService,
        ModalService,
        Notification,
        ResearchItemService,
        researchItemKinds,
        researchItemLabels,
        ResearchItemTypesService,
        Prototyper
    ) {
        const service = Restangular.service('researchentities');

        service.getResearchEntity = getResearchEntity;
        service.getNewItemDraft = getNewItemDraft;
        service.editDraft = editDraft;
        service.createDraft = createDraft;
        service.updateDraft = updateDraft;
        service.deleteDraft = deleteDraft;
        service.deleteDrafts = deleteDrafts;
        service.copy = copy;
        service.multipleCopy = multipleCopy;
        service.verify = verify;
        service.multipleVerify = multipleVerify;
        service.unverify = unverify;
        service.discard = discard;
        service.multipleDiscard = multipleDiscard;
        service.editAffiliations = editAffiliations;
        service.updateAuthors = updateAuthors;
        service.getAccomplishmentDrafts = getAccomplishmentDrafts;
        service.getSuggestedAccomplishments = getSuggestedAccomplishments;
        service.getDiscardedAccomplishments = getDiscardedAccomplishments;
        service.getAccomplishment = getAccomplishment;
        service.getAccomplishments = getAccomplishments;
        service.setVerifyPrivacy = setVerifyPrivacy;
        service.setVerifyFavorite = setVerifyFavorite;
        service.getProjects = getProjects;
        service.getMinMaxYears = getMinMaxYears;
        service.getPatents = getPatents;
        service.getPatentFamilies = getPatentFamilies;
        service.getAgreements = getAgreements;
        service.getAgreementDrafts = getAgreementDrafts;
        service.getAgreementGroups = getAgreementGroups;

        const accomplishmentPopulates = ['type', 'authors', 'affiliations', 'institutes', 'verified', 'source', 'verifiedUsers', 'verifiedGroups'];
        const projectPopulates = ['type', 'verified', 'verifiedUsers', 'verifiedGroups'];
        const patentPopulates = ['type', 'verified', 'verifiedUsers', 'verifiedGroups', 'authors', 'affiliations', 'institutes'];

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
                {proceed: 'Proceed'},
                'Cancel',
                true);

            if (res === 'proceed') {
                try {
                    const deletedDraft = await researchEntity.one('researchItemDrafts', draft.id).remove();

                    Notification.success('Draft deleted');
                    EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_DELETED, deletedDraft);
                } catch (e) {
                    Notification.warning('Failed to delete draft');
                    console.error(e);
                }
            }
        }

        async function deleteDrafts(researchEntity, drafts) {
            const draftIds = drafts.map(d => d.id);
            try {
                const results = await researchEntity.all('researchItemDrafts').customPUT({draftIds: draftIds}, 'delete');
                Notification.success(results.length + ' draft(s) deleted');
                EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_DELETED, results);
            } catch (err) {
                Notification.warning("An error happened");
            }
        }

        async function copy(researchEntity, researchItem) {
            try {
                const res = await copyResearchItem(researchEntity, researchItem.id);
                if (res.success) {
                    Notification.success('Item copied to drafts');
                    EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_CREATED);
                    ResearchItemService.addLabel(researchItem, researchItemLabels.ALREADY_IN_DRAFTS);
                }
            } catch (err) {
                Notification.warning("An error happened");
            }
        }

        async function multipleCopy(researchEntity, researchItems) {
            const itemIds = researchItems.map(ri => ri.id);
            try {
                const res = await researchEntity.customPOST({itemIds}, 'copy-research-items');
                if (res.error)
                    return Notification.warning(res.error);

                EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_CREATED, res);
                Notification.success("item(s) copied to drafts");

            } catch (error) {
                Notification.warning(error);
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

        async function multipleVerify(researchEntity, researchItems) {
            const itemIds = researchItems.map(ri => ri.id);
            const res = await researchItemMultipleVerify(researchEntity, itemIds);

            const success = res.filter(r => r.success);
            const failed = res.filter(r => !r.success);

            if (success.length > 0) {
                if (success.find(r => r.researchItem.kind === researchItemKinds.DRAFT))
                    EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_VERIFIED, res);
                if (success.find(r => r.researchItem.kind === researchItemKinds.VERIFIED))
                    EventsService.publish(EventsService.RESEARCH_ITEM_VERIFIED, res);

                Notification.success(success.length + " item(s) verified");
            }
            if (failed.length > 0)
                Notification.warning(failed.length + " item(s) not verified: \n" + failed.map(f => f.message).join('\n'));
        }

        async function unverify(researchEntity, researchItem) {
            ResearchItemService.addLabel(researchItem, researchItemLabels.UVERIFYING);

            const buttonKey = await ModalService.multipleChoiceConfirm('Unverifying',
                'Unverifying an item removes it from your profile, you can choose:\n\n' +
                'Move to drafts: to move the item in your drafts.\n' +
                'Remove: to remove it completely from your profile.',
                {move: 'Move to drafts', remove: 'Remove'},
                'Cancel',
                true);
            try {
                switch (buttonKey) {
                    case 'cancel':
                        ResearchItemService.removeLabel(researchItem, researchItemLabels.UVERIFYING);
                        return;
                    case 'move':
                        await copyResearchItem(researchEntity, researchItem.id);
                        EventsService.publish(EventsService.RESEARCH_ITEM_DRAFT_CREATED, {});
                        break;
                    case 'remove':
                        break;
                }

                try {
                    await unverifyResearchItem(researchEntity, researchItem.id);
                    EventsService.publish(EventsService.RESEARCH_ITEM_UNVERIFIED, {});
                    Notification.success("Item successfully unverified");
                } catch (e) {
                    Notification.warning("Failed to unverify");
                }
            } catch (e) {
                ResearchItemService.removeLabel(researchItem, researchItemLabels.UVERIFYING);
            }
        }

        async function discard(researchEntity, researchItem) {
            try {
                const res = await researchEntity.one('researchitems', researchItem.id)
                    .customPUT({}, 'discarded');

                if (!res.success)
                    return Notification.warning(res.message);

                EventsService.publish(EventsService.RESEARCH_ITEM_DISCARDED, res);

            } catch (error) {
                if (error.data)
                    Notification.warning(error.data.message);
                console.error(error);
            }
        }

        async function multipleDiscard(researchEntity, researchItems) {
            try {
                const itemIds = researchItems.map(ri => ri.id);
                const res = await researchEntity.all('researchitems').customPUT({itemIds}, 'discarded');
                EventsService.publish(EventsService.RESEARCH_ITEM_DISCARDED, res);
            } catch (error) {
                if (error.data)
                    Notification.warning(error.data.message);
                console.error(error);
            }
        }

        async function getAccomplishment(id, populates = accomplishmentPopulates) {
            return await Restangular.one('accomplishments', id).get({populate: populates});
        }

        async function getAccomplishments(researchEntity, query, favorites = false, populates = accomplishmentPopulates) {
            const populate = {populate: populates};
            const q = _.merge({}, query, populate);

            if (favorites) {
                return researchEntity.getList('favoriteAccomplishments', q);
            } else {
                return researchEntity.getList('accomplishments', q);
            }
        }

        async function getAccomplishmentDrafts(researchEntity, query, populates = accomplishmentPopulates) {
            const populate = {populate: populates};
            const q = _.defaultsDeep({}, query, populate);
            const draftList = await researchEntity.getList('accomplishmentDrafts', q);

            draftList.forEach(d => {
                if (d.kind === 'd' && (new Date(d.createdAt)).toDateString() === (new Date()).toDateString())
                    ResearchItemService.addLabel(d, researchItemLabels.NEW);
            });
            return draftList;
        }

        async function getSuggestedAccomplishments(researchEntity, query) {
            const populate = {populate: accomplishmentPopulates};
            const q = _.defaultsDeep({}, query, populate);
            return await researchEntity.getList('suggestedAccomplishments', q);
        }

        async function getDiscardedAccomplishments(researchEntity, query) {
            const populate = {populate: accomplishmentPopulates};
            const q = _.defaultsDeep({}, query, populate);
            const discarded = await researchEntity.getList('discardedAccomplishments', q);
            discarded.forEach(d => ResearchItemService.addLabel(d, researchItemLabels.DISCARDED));
            return discarded
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
                if (error.data)
                    Notification.warning(error.data.message);
                console.error(error);
            }

        }

        async function researchItemMultipleVerify(researchEntity, itemIds) {
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

        async function getMinMaxYears(researchEntity, type) {
            return await researchEntity.one('min-max-years', type).get();
        }

        async function getProjects(researchEntity, query, favorites = false, populates = projectPopulates) {
            const populate = {populate: populates};
            const q = _.merge({}, query, populate);
            const types = await ResearchItemTypesService.getTypes();

            if (q.where && q.where.type) {
                if (q.where.type === allProjectTypes.value) {
                    delete q.where.type;
                } else {
                    const type = types.find(type => type.key === q.where.type);
                    q.where.type = type.id;
                }
            }

            if (favorites) {
                return await researchEntity.getList('favoriteProjects', q);
            } else {
                return await researchEntity.getList('projects', q);
            }
        }

        async function getPatents(researchEntity, query, favorites = false, populates = patentPopulates) {
            const populate = {populate: populates};
            const q = _.merge({}, query, populate);

            if (favorites) {
                return await researchEntity.getList('favoritePatents', q);
            } else {
                return await researchEntity.getList('patents', q);
            }
        }

        async function getPatentFamilies(researchEntity, query) {
                return await researchEntity.getList('patentFamilies', query);
        }
        /* jshint ignore:end */

        function getAgreements() {
            const agreements = [];
            const agreement =  {
                "administrators": [
                    {
                        "username": "camilla.coletti@iit.it",
                        "name": "Camilla",
                        "surname": "Coletti",
                        "slug": "camilla-coletti",
                        "alreadyAccess": true,
                        "alreadyOpenedSuggested": true,
                        "already_changed_profile": false,
                        "role": "user",
                        "orcidId": null,
                        "scopusId": "56227871700",
                        "jobTitle": "Senior Researcher Tenure Track - Principal Investigator",
                        "display_name": "Camilla",
                        "display_surname": "Coletti",
                        "config": {
                            "scientific": true
                        },
                        "lastsynch": "2020-11-20T17:22:59.000Z",
                        "active": true,
                        "synchronized": true,
                        "contract_end_date": "2025-06-29T22:00:00.000Z",
                        "cid": "10000252",
                        "id": 173,
                        "createdAt": "2017-05-26T08:55:06.000Z",
                        "updatedAt": "2020-12-01T11:05:13.000Z",
                        "auth": 173,
                        "researchEntity": 290
                    }
                ],
                "title": "Lorem Ipsum is simply dummy text.",
                "subject": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                "type": "Agreement type",
                "startYear": "2019",
                "endYear": "2022",
                "startDate": "2019-03-01",
                "endDate": "2022-02-28",
                "budget": 90000,
                "contribution": 20000,
                "partners": [
                    {
                        "email": "Matteo.Marzi@iit.it",
                        "name": "Matteo Jacopo Luca Nicolo",
                        "surname": "Marzi"
                    }, {
                        "email": "john.doe@iit.it",
                        "name": "John",
                        "surname": "Doe"
                    }
                ],
                "piStr": "Matteo.Marzi@iit.it Matteo Jacopo Luca Nicolo Marzi",
                "pi": [
                    {
                        "email": "Matteo.Marzi@iit.it",
                        "name": "Matteo Jacopo Luca Nicolo",
                        "surname": "Marzi"
                    }
                ],
                "verified": [
                    {
                        "researchEntity": {
                            "id": 1
                        }
                    }
                ],
                "verifiedUsers": [],
                "verifiedGroups": [
                    {
                        "researchEntity": {
                            "id": 1
                        }
                    }
                ],
                "generatedGroup": false
            };

            for (let i = 1; i <= 10; i++) {
                const tmpAgreement = _.cloneDeep(agreement);
                tmpAgreement.id = i;
                if (i === 2) {
                    tmpAgreement.generatedGroup = i;
                }
                Prototyper.toAgreementModel(tmpAgreement);
                agreements.push(tmpAgreement);
            }

            return agreements;
        }

        function getAgreementDrafts() {
            return getAgreements();
        }

        function getAgreementGroups() {
            const groups = [];
            const group =  {
                "agreement": {
                    "administrators": [
                        {
                            "username": "camilla.coletti@iit.it",
                            "name": "Camilla",
                            "surname": "Coletti",
                            "slug": "camilla-coletti",
                            "alreadyAccess": true,
                            "alreadyOpenedSuggested": true,
                            "already_changed_profile": false,
                            "role": "user",
                            "orcidId": null,
                            "scopusId": "56227871700",
                            "jobTitle": "Senior Researcher Tenure Track - Principal Investigator",
                            "display_name": "Camilla",
                            "display_surname": "Coletti",
                            "config": {
                                "scientific": true
                            },
                            "lastsynch": "2020-11-20T17:22:59.000Z",
                            "active": true,
                            "synchronized": true,
                            "contract_end_date": "2025-06-29T22:00:00.000Z",
                            "cid": "10000252",
                            "id": 173,
                            "createdAt": "2017-05-26T08:55:06.000Z",
                            "updatedAt": "2020-12-01T11:05:13.000Z",
                            "auth": 173,
                            "researchEntity": 290
                        }
                    ],
                    "title": "Lorem Ipsum is simply dummy text.",
                    "subject": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "type": "Agreement type",
                    "startYear": "2019",
                    "endYear": "2022",
                    "startDate": "2019-03-01",
                    "endDate": "2022-02-28",
                    "budget": 90000,
                    "contribution": 20000,
                    "partners": [
                        {
                            "email": "Matteo.Marzi@iit.it",
                            "name": "Matteo Jacopo Luca Nicolo",
                            "surname": "Marzi"
                        }
                    ],
                    "piStr": "Matteo.Marzi@iit.it Matteo Jacopo Luca Nicolo Marzi",
                    "pi": [
                        {
                            "email": "Matteo.Marzi@iit.it",
                            "name": "Matteo Jacopo Luca Nicolo",
                            "surname": "Marzi"
                        }
                    ],
                    "verified": [
                        {
                            "researchEntity": {
                                "id": 1
                            }
                        }
                    ],
                    "verifiedUsers": [],
                    "verifiedGroups": [
                        {
                            "researchEntity": {
                                "id": 1
                            }
                        }
                    ],
                    "generatedGroup": false
                },
                "administrators": [
                    {
                        "username": "camilla.coletti@iit.it",
                        "name": "Camilla",
                        "surname": "Coletti",
                        "slug": "camilla-coletti",
                        "alreadyAccess": true,
                        "alreadyOpenedSuggested": true,
                        "already_changed_profile": false,
                        "role": "user",
                        "orcidId": null,
                        "scopusId": "56227871700",
                        "jobTitle": "Senior Researcher Tenure Track - Principal Investigator",
                        "display_name": "Camilla",
                        "display_surname": "Coletti",
                        "config": {
                            "scientific": true
                        },
                        "lastsynch": "2020-11-20T17:22:59.000Z",
                        "active": true,
                        "synchronized": true,
                        "contract_end_date": "2025-06-29T22:00:00.000Z",
                        "cid": "10000252",
                        "id": 173,
                        "createdAt": "2017-05-26T08:55:06.000Z",
                        "updatedAt": "2020-12-01T11:05:13.000Z",
                        "auth": 173,
                        "researchEntity": 290
                    }
                ],
                "title": "Lorem Ipsum is simply dummy text.",
            };

            for (let i = 1; i <= 10; i++) {
                const tmpGroup = _.cloneDeep(group);
                tmpGroup.id = i;
                Prototyper.toAgreementGroupModel(tmpGroup);
                groups.push(tmpGroup);
            }

            return groups;
        }

        return service;
    }
}());