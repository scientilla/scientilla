(function () {
    angular.module("services")
        .factory("EventsService", ModalService);

    ModalService.$inject = [
        '$rootScope'
    ];

    function ModalService($rootScope) {
        var subscriptions = [];
        var service = {
            AUTH_LOGIN: 'auth.login',
            AUTH_LOGOUT: 'auth.logout',

            DRAFT_DELETED: 'draft.deleted',
            DRAFT_UPDATED: 'draft.updated',
            DRAFT_CREATED: 'draft.created',
            DRAFT_VERIFIED: 'draft.verified',
            DRAFT_UNVERIFIED: 'draft.unverified',

            DRAFT_SYNCHRONIZED: 'draft.synchronized',

            DOCUMENT_VERIFIED: 'document.verified',
            DOCUMENT_PRIVATE_TAGS_UPDATED: 'document.privateTagsUpdated',
            DOCUMENT_AUTORSHIP_PRIVACY_UPDATED: 'document.authorship.privacyUpdated',
            DOCUMENT_AUTORSHIP_FAVORITE_UPDATED: 'document.authorship.favoriteUpdated',
            DOCUMENT_DISCARDED: 'document.discarded',
            DOCUMENT_NOT_DUPLICATED: 'document.notDuplicated',
            DOCUMENT_COMPARE: 'document.compare',

            NOTIFICATION_ACCEPTED: 'notification.accepted',
            NOTIFICATION_DISCARDED: 'notification.discarded',

            SOURCE_CREATED: 'source.created',

            INSTITUTE_RESTORED: 'institute.restored',

            CONTEXT_CHANGE: 'context.change',

            ACCOMPLISHMENT_VERIFIED: 'accomplishment.verified',

            ACCOMPLISHMENT_DRAFT_DELETED: 'accomplishment.draft.deleted',
            ACCOMPLISHMENT_DRAFT_UPDATED: 'accomplishment.draft.updated',
            ACCOMPLISHMENT_DRAFT_CREATED: 'accomplishment.draft.created',
            ACCOMPLISHMENT_DRAFT_VERIFIED: 'accomplishment.draft.verified',
            ACCOMPLISHMENT_DRAFT_UNVERIFIED: 'accomplishment.draft.unverified',
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
