/**
 * BackupController
 *
 * @description :: Server-side logic for managing Backups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getDumps: async function (req, res) {
        const dumps = await Backup.getDumps();
        const dumpsList = {
            items: dumps,
            count: dumps.length
        };
        res.halt(Promise.resolve(dumpsList));
    },
    make: async function (req, res) {
        const filename = await Backup.makeManualBackup();
        res.halt(Promise.resolve({filename: filename}));
    },
    restore: async function (req, res) {
        const filename = req.body.filename;
        const autoBackup = req.body.autoBackup;
        Status.disable();
        await Backup.restoreBackup(filename, autoBackup);
        Status.enable();
        res.halt(Promise.resolve({}));
    },
    upload: async function (req, res) {
        const result = await Backup.upload(req);
        res.halt(Promise.resolve(result));
    },
    remove: async function (req, res) {
        const filename = req.body.filename;
        const result = await Backup.remove(filename);
        res.halt(Promise.resolve(result));
    },
    download: async function (req, res) {
        const filename = req.body.filename;
        const autoBackup = req.body.autoBackup;
        try {
            const download = await Backup.download(filename, autoBackup);
            download.pipe(res, {end: true});
        } catch (err) {
            res.halt(Promise.reject(err));
        }
    }
};

