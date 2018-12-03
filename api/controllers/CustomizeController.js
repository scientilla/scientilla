/**
 * CustomizeController
 *
 * @description :: Server-side logic for managing customizable config settings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');
var path = require('path');

module.exports = {
    getInstitute: function (req, res) {
        res.halt(Promise.resolve(sails.config.customizations));
    },

    setInstitute: function (req, res) {

        let institute = JSON.parse(req.body.institute);
        let footer = JSON.parse(req.body.footer);

        sails.config.customizations.institute = institute;
        sails.config.customizations.footer = footer;

        req.file('logo').upload({
            dirname: path.resolve(sails.config.appPath, 'assets/uploads')
        }, function (err, files) {
            if (err)
                return res.serverError(err);

            if (files.length > 0) {
                let src = files[0].fd.split('/');
                src = src[src.length - 1];

                sails.config.customizations.header.logo = {
                    src: '/uploads/' + src,
                    name: files[0].filename
                };

                switch(true) {
                    case sails.config.environment === 'development':
                        GruntTaskRunner.run('copy:uploadsDev');
                        break;
                    case sails.config.environment === 'production':
                        GruntTaskRunner.run('copy:uploadsBuild');
                        break;
                    default:
                        break;
                }
            }

            fs.writeFileSync(sails.config.appPath + '/config/customizations.js',
                'module.exports.customizations = ' + JSON.stringify(sails.config.customizations));

            return res.json({
                type: 'success',
                message: 'Cusomizations succesfully saved!',
                customizations: sails.config.customizations,
            });
        });
    }
};

