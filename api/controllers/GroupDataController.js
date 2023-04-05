/**
 * GroupDataController
 *
 * @description :: Server-side logic for managing Group Data
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const path = require('path');
const fs = require('fs');

async function getImageOfGroup (res, group) {

    if (!group || (group && !_.has(group, 'researchEntity'))) {
        return res.notFound({
            message: 'Group not found!'
        });
    }

    const data = await GroupData.findOne({researchEntity: group.researchEntity});

    if (!_.has(data, 'profile')) {
        return res.notFound({
            message: 'Profile not found!'
        });
    }

    const profile = data.profile;

    if (_.has(profile, 'coverImage.privacy') && profile.coverImage.privacy !== 'public') {
        return res.forbidden({
            message: 'This image is not public!'
        });
    }

    const image = await GroupData.getCoverImage(group, profile);

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

module.exports = {
    getCoverImageByCode: async function (req, res, next) {
        const code = req.params.code;
        const group = await Group.findOne({code: code});

        return getImageOfGroup(res, group);
    },
    getCoverImageBySlug: async function (req, res, next) {
        const slug = req.params.slug;
        const group = await Group.findOne({slug});

        return getImageOfGroup(res, group);
    }
};
