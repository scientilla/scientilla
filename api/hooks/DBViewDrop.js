"use strict";

const fs = require('fs');
const viewPath = 'config/databaseViews';

module.exports = sails => {


    const views = fs.readdirSync(viewPath)
        .map(file => file.slice(0, -4));

    return {
        initialize: (next) => {
            if (sails.config.models.migrate === 'safe') {
                next();
                return;
            }

            sails.after('hook:blueprints:loaded', () => {
                const dropQuery = views.map(view => 'DROP VIEW IF EXISTS ' + view + ';').join(' ');
                SqlService.query(dropQuery)
                    .then(res => {
                        sails.log.debug('Drop View Query executed successfully');
                        next();
                    })
                    .catch(err => {
                        sails.log.error('Error running query: ' + err);
                    });
            });
        }
    };
};