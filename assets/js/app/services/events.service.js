// noinspection JSVoidFunctionReturnValueUsed

(function () {
    angular.module("services")
        .factory("EventsService", service);

    service.$inject = [
        '$rootScope'
    ];

    function service($rootScope) {
        const subscriptions = [];
        const service = {
            AUTH_LOGIN: 'auth.login',
            AUTH_LOGOUT: 'auth.logout',
            AUTH_USER_CHANGED: 'auth.userChanged',

            DRAFT_DELETED: 'draft.deleted',
            DRAFT_UPDATED: 'draft.updated',
            DRAFT_CREATED: 'draft.created',
            DRAFT_VERIFIED: 'draft.verified',
            DRAFT_SYNCHRONIZED: 'draft.synchronized',

            DOCUMENT_VERIFIED: 'document.verified',
            DOCUMENT_PRIVATE_TAGS_UPDATED: 'document.privateTagsUpdated',
            DOCUMENT_AUTORSHIP_PRIVACY_UPDATED: 'document.authorship.privacyUpdated',
            DOCUMENT_AUTORSHIP_FAVORITE_UPDATED: 'document.authorship.favoriteUpdated',
            DOCUMENT_DISCARDED: 'document.discarded',
            DOCUMENT_NOT_DUPLICATED: 'document.notDuplicated',
            DOCUMENT_COMPARE: 'document.compare',
            DOCUMENT_UNVERIFIED: 'document.unverified',

            NOTIFICATION_ACCEPTED: 'notification.accepted',
            NOTIFICATION_DISCARDED: 'notification.discarded',

            SOURCE_CREATED: 'source.created',

            INSTITUTE_RESTORED: 'institute.restored',

            CONTEXT_CHANGE: 'context.change',

            RESEARCH_ITEM_VERIFIED: 'researchItem.verified',
            RESEARCH_ITEM_UNVERIFIED: 'researchItem.unverified',
            RESEARCH_ITEM_DISCARDED: 'researchItem.discarded',

            RESEARCH_ITEM_DRAFT_DELETED: 'researchItem.draft.deleted',
            RESEARCH_ITEM_DRAFT_UPDATED: 'researchItem.draft.updated',
            RESEARCH_ITEM_DRAFT_CREATED: 'researchItem.draft.created',
            RESEARCH_ITEM_DRAFT_VERIFIED: 'researchItem.draft.verified',

            CUSTOMIZATIONS_CHANGED: 'customizations.changed',
            CONNECTORS_CHANGED: 'external.connectors.changed',

            USER_PROFILE_CHANGED: 'userProfile.changed',
            USER_PROFILE_SAVED: 'userProfile.saved',

            PROJECT_GROUP_CREATED: 'projectGroup.created',
            PROJECT_GROUP_DELETED: 'projectGroup.deleted',

            GROUP_UPDATED: 'group.updated'
        };

        service.publish = function (event, args) {
            $rootScope.$broadcast(event, args);
        };

        service.subscribe = function (subscriber, event, cb) {
            const subscription = getOrCreateSubscription(subscriber);
            register(subscription, event, cb);
        };

        service.subscribeAll = function (subscriber, events, cb) {
            const subscription = getOrCreateSubscription(subscriber);
            _(events).each(function (event) {
                register(subscription, event, cb);
            });
        };

        service.unsubscribeAll = function (subscriber) {
            const subscription = getOrCreateSubscription(subscriber);

            _(subscription.unregisterFunctions)
                .forEach(function (unregister) {
                    unregister();
                });
        };

        return service;

        function register(subscription, event, cb) {
            subscription.unregisterFunctions.push($rootScope.$on(event, cb));
        }

        function getOrCreateSubscription(subscriber) {
            var subscription = _.find(subscriptions, {subscriber: subscriber});

            if (!subscription) {
                subscription = {
                    subscriber: subscriber,
                    unregisterFunctions: []
                };

                subscriptions.push(subscription);
            }
            return subscription;
        }

    }

}());
