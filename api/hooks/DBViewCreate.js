"use strict";

const fs = require('fs');
const viewPath = 'config/databaseViews';

module.exports = sails => {

    return {
        initialize: next => {
            sails.after('hook:orm:loaded', () => {
                const createQuery = fs.readdirSync(viewPath)
                    .map(view => fs.readFileSync(viewPath + '/' + view, 'utf-8'))
                    .join('; ');
                SqlService.query(createQuery)
                    .then(res => {
                        sails.log.debug('Create View Query executed successfully');
                        next();
                    })
                    .catch(err => {
                        sails.log.error('Error running query: ' + err);
                    });
            });
        }
    };
};