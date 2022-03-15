const GeneralSettings = require('../services/GeneralSettings');

const name = 'tasks';

module.exports = {
    run: async function (req, res) {
        const command = req.body.command;
        const setting = await GeneralSettings.findOrCreate(name);
        if (_.has(setting.data, command) && setting.data[command]) {
            return res.halt(Promise.resolve('Already running!'));
        }
        setting.data[command] = true;
        await GeneralSettings.save(name, JSON.stringify(setting.data));

        try{
            const result = await GruntTaskRunner.run(command);
            res.halt(Promise.resolve(result));
        } catch(e) {
            return res.notFound({
                message: 'Task not found!'
            });
        } finally {
            setting.data[command] = false;
            await GeneralSettings.save(name, JSON.stringify(setting.data));
        }
    },
    isRunning: async function (req, res) {
        const command = req.params.command;
        const setting = await GeneralSettings.findOrCreate(name);

        if (_.has(setting.data, command)) {
            res.halt(Promise.resolve(setting.data[command]));
        } else {
            res.halt(Promise.resolve(false));
        }
    }
};
