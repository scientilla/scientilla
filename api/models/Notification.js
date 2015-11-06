/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        
        
    },
    getUserNotifications: function (userId) {
        var notifications = {};
        return User.find({id: userId}).populate('coauthors')
                .then(function (user) {
                    notifications.references = user.coauthors;
                    return notifications;
                });
    }
};

