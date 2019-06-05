(function () {
    angular.module("services")
        .factory("EventsService", service);

    service.$inject = [
        '$rootScope'
    ];

    function service($rootScope) {
        var subscriptions = [];
        var service = {
            AUTH_LOGIN: 'auth.login',
            AUTH_LOGOUT: 'auth.logout',

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

            RESEARCH_ITEM_VERIFIED: 'accomplishment.verified',
            RESEARCH_ITEM_UNVERIFIED: 'accomplishment.unverified',

            RESEARCH_ITEM_DRAFT_DELETED: 'accomplishment.draft.deleted',
            RESEARCH_ITEM_DRAFT_UPDATED: 'accomplishment.draft.updated',
            RESEARCH_ITEM_DRAFT_CREATED: 'accomplishment.draft.created',
            RESEARCH_ITEM_DRAFT_VERIFIED: 'accomplishment.draft.verified',
        };

        service.publish = function (event, args) {
            $rootScope.$broadcast(event, args);
        };

        service.subscribe = function (subscriber, event, cb) {
            var subscription = getOrCreateSubscription(subscriber);
            register(subscription, event, cb);
        };

        service.subscribeAll = function (subscriber, events, cb) {
            var subscription = getOrCreateSubscription(subscriber);
            _(events).each(function (event) {
                register(subscription, event, cb);
            });
        };

        service.unsubscribeAll = function (subscriber) {
            var subscription = getOrCreateSubscription(subscriber);

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
