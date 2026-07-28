/* global ResearchEntityData, ResearchEntity, ResearchItem, Verify */


module.exports = {
    createDraft(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const draftData = req.body;
        res.halt(ResearchItem.createDraft(researchEntityId, draftData));
    },
    updateDraft(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const draftId = +req.params.itemId;
        const draftData = req.body;
        res.halt(ResearchItem.updateDraft(researchEntityId, draftId, draftData));
    },
    deleteDraft(req, res, next) {
        const draftId = +req.params.itemId;
        res.halt(ResearchItem.deleteDraft(draftId));
    },
    deleteDrafts(req, res, next) {
        const draftIds = req.param('draftIds');
        res.halt(ResearchItem.blukAction(ResearchItem, 'deleteDraft', draftIds));
    },
    setResearchItemAuthors(req, res, next) {
        const draftId = +req.params.itemId;
        const authorsData = req.body;
        res.halt(ResearchItem.setResearchItemAuthors(draftId, authorsData));
    },
    verify(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemId = +req.params.itemId;
        const verificationData = req.body;
        res.halt(Verify.verify(itemId, researchEntityId, verificationData));
    },
    multipleVerify(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemIds = req.param('itemIds');
        res.halt(ResearchItem.blukAction(Verify, 'verify', itemIds, [researchEntityId]));
    },
    unverify(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemId = +req.params.itemId;
        res.halt(Verify.unverify(researchEntityId, itemId));
    },
    discard(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemId = +req.params.itemId;
        res.halt(ResearchEntity.discardResearchItem(itemId, researchEntityId));
    },
    multipleDiscard(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemIds = req.param('itemIds');
        res.halt(ResearchEntity.blukAction(ResearchEntity, 'discardResearchItem', itemIds, [researchEntityId]));
    },
    setPublic(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const researchItemId = +req.params.itemId;
        const publicFlag = req.body.public;
        res.halt(Verify.setPublic(researchEntityId, researchItemId, publicFlag));
    },
    setFavorite(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const researchItemId = +req.params.itemId;
        const favorite = req.body.favorite;
        res.halt(Verify.setFavorite(researchEntityId, researchItemId, favorite));
    },
    copyToDraft(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        const researchItemId = req.param('researchItemId');
        res.halt(ResearchItem.copyToDraft(researchItemId, researchEntityId));
    },
    copyAllToDraft(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        const researchItemIds = req.param('itemIds');
        res.halt(ResearchItem.blukAction(ResearchItem, 'copyToDraft', researchItemIds, [researchEntityId]));
    },
    getProfile(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        res.halt(ResearchEntityData.getProfile(researchEntityId));
    },
    getEditProfile(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        res.halt(ResearchEntityData.getEditProfile(researchEntityId));
    },
    saveProfile(req, res, next) {
        res.halt(ResearchEntityData.saveProfile(req));
    },
    async exportProfile(req, res) {
        const researchEntityId = parseInt(req.params.researchEntityId, 10);
        const type = req.body.type;
        const options = req.body.options;
        const string = await ResearchEntityData.exportProfile(researchEntityId, type, options);
        res.set('Content-Type', 'application/octet-stream');
        res.send(string);
    },
    getSuggestedProjects(req, res) {
        return getSuggested(req, res, Project, 'suggestion_project');
    },
    getSuggestedPatents(req, res) {
        return getSuggested(req, res, Patent, 'suggestion_patent');
    },
    getSuggestedAccomplishments(req, res) {
        return getSuggested(req, res, Accomplishment, 'suggestion_accomplishment');
    },
    getSuggestedTrainingModules(req, res) {
        return getSuggested(req, res, TrainingModule, 'suggestion_training_module');
    },
};

async function getSuggested(req, res, Model, viewName) {
    const researchEntityId = +req.params.researchEntityId;
    const limit = req.param('limit');
    const skip = req.param('skip');
    const sort = req.param('sort');
    const populate = req.param('populate');
    let where = req.param('where');

    try {
        const sql = `SELECT research_item FROM ${viewName} WHERE research_entity = $1`;
        const results = await SqlService.query(sql, [researchEntityId]);
        const ids = results.map(r => r.research_item);

        if (ids.length === 0) {
            return res.halt(Promise.resolve({
                count: 0,
                items: []
            }));
        }

        let queryOptions = {
            id: ids
        };

        if (where) {
            try {
                const parsedWhere = typeof where === 'string' ? JSON.parse(where) : where;
                if (parsedWhere.id) {
                    const requestIds = Array.isArray(parsedWhere.id) ? parsedWhere.id : [parsedWhere.id];
                    queryOptions.id = ids.filter(x => requestIds.includes(x));
                }
                queryOptions = Object.assign({}, parsedWhere, queryOptions);
            } catch (e) {}
        }

        let query = Model.find(queryOptions);

        if (limit) query = query.limit(limit);
        if (skip) query = query.skip(skip);
        if (sort) query = query.sort(sort);

        if (populate) {
            const populateArray = Array.isArray(populate) ? populate : [populate];
            populateArray.forEach(p => {
                query = query.populate(p);
            });
        }

        const count = await Model.count(queryOptions);
        const items = await query;
        res.halt(Promise.resolve({
            count: count,
            items: items
        }));
    } catch (err) {
        res.halt(Promise.reject(err));
    }
}

