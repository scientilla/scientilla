/**
 * ExternalConnectorsController
 *
 * @description :: Server-side logic for managing external connector config settings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');

module.exports = {
    getConnectors: function (req, res) {
        res.halt(Promise.resolve(sails.config.connectors));
    },

    setConnector: function (req, res) {
        let connector = JSON.parse(req.body.connector);

        switch(connector.type) {
            case 'elsevier':
                sails.config.connectors.elsevier = connector.data;
                break;
            default:
                break;
        }

        fs.writeFile(sails.config.appPath + '/config/connectors.js',
            'module.exports.connectors = ' + JSON.stringify(sails.config.connectors),
            function(err) {
                if (err) {
                    return console.log(err);
                }

                return res.json({
                    type: 'success',
                    message: 'External connectors succesfully saved!',
                    connectors: sails.config.connectors,
                });
            }
        );
    }
};

