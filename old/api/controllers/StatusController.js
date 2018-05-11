/**
 * StatusController
 *
 * @description :: Server-side logic for managing commands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    enable: function (req, res) {
        Status.enable();
        res.halt(Promise.resolve({}));
    },
    disable: function (req, res) {
        Status.disable();
        res.halt(Promise.resolve({}));
    }
};

