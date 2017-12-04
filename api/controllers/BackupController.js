/**
 * BackupController
 *
 * @description :: Server-side logic for managing Backups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getDumps: function (req, res) {
        const dumps = Backup.getDumps();
        const dumpsList = {
            items: dumps,
            count: dumps.length
        };
        res.halt(Promise.resolve(dumpsList));
    },
    make: async function (req, res) {
        const filename = await Backup.makeTimestampedBackup();
        res.halt(Promise.resolve({filename: filename}));
    },
    restore: async function (req, res) {
        const filename = req.body.filename;
        Status.disable();
        await Backup.restoreBackup(filename);
        Status.enable();
        res.halt(Promise.resolve({}));
    },
};

