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
        const user = await User.findOne({username});
        const data = await UserData.findOne({researchEntity: user.researchEntity});
        const profile = data.profile;

        if (_.has(profile, 'hidden.value') && profile.hidden.value) {
            return res.forbidden({
                message: 'This profile is not public!'
            });
        }

        if (_.has(profile, 'image.privacy') && profile.image.privacy !== 'public') {
            return res.forbidden({
                message: 'This image is not public!'
            });
        }

        const image = await UserData.getProfileImage(user, profile);

        if (image) {
            const imagePath = path.join(sails.config.appPath, image);
            const stream = fs.createReadStream(imagePath);
            stream.pipe(res)
        } else {
            return res.notFound({
                message: 'Image not found!'
            });
        }
    }
};