module.exports = {
    start: () => {
        const fs = require('fs');
        const path = require('path');
        const _ = require('lodash');
        const Sequelize = require('sequelize');


        const db = new Sequelize(configs.db.database, configs.db.username, configs.db.password, {
            host: configs.db.host,
            dialect: configs.db.dialect,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            operatorsAliases: false,
            logging: false
        });

        const models = {};
        const modelsLocation = path.join(__dirname, '../models/');

        fs.readdirSync(modelsLocation).forEach(filename => {
            const modelPath = path.join(modelsLocation, filename);
            const name = _.capitalize(filename.replace(/\.[^/.]+$/, ""));
            models[name] = db.import(modelPath);
            global[name] = models[name];
        });

        Object.keys(models).forEach(modelName => {
            const model = models[modelName];
            if (_.isFunction(model.associate))
                model.associate(models);
        });

        global.db = db;
    }
};