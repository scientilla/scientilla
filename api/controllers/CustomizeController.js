/* global Customize */

module.exports = {
    getCustomizations: function (req, res) {
        res.halt(Customize.getCustomizations());
    },
    setCustomizations: function (req, res) {
        let footer = JSON.parse(req.body.footer);
        let styles = JSON.parse(req.body.styles);

        res.halt(Customize.setCustomizations(req, footer, styles));
    },

    resetCustomizations: function (req, res) {
        res.halt(Customize.resetCustomizations());
    }
};

