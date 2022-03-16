const name = 'tasks';

module.exports = {
    run: async function (req, res) {
        const command = req.body.command;

        try{
            const result = await GruntTaskRunner.run(command);
            res.halt(Promise.resolve(result));
        } catch(e) {
            return res.notFound({
                message: 'Task not found!'
            });
        }
    },
    isRunning: async function (req, res) {
        const command = req.params.command;
        const setting = await GeneralSetting.findOne({name});

        if (setting && _.has(setting.data, command)) {
            res.halt(Promise.resolve(setting.data[command]));
        } else {
            res.halt(Promise.resolve(false));
        }
    }
};
