/**
 * NotificationController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    find: function(req, res) {
        var userId = req.params.id;
        Notification
                .getUserNotifications(userId)
                .then(function(notifications){
                    res.json(notifications);
                });
    }
};

