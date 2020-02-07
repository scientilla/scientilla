/**
 * TagLabelController
 *
 * @description :: Server-side logic for managing Journals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const path = require('path');
const fs = require('fs');

module.exports = {
    getProfileImage: async function (req, res, next) {
        const username = req.params.username;
        const image = await UserData.getProfileImage(username);
        if (image) {
            const imagePath = path.join(sails.config.appPath, image);
            const stream = fs.createReadStream(imagePath);
            stream.pipe(res)
        } else {
            res.notFound();
        }
    }
};