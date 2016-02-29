
module.exports = function end(promise, options) {
    var res = this.res;
    
    promise
            .then(function (suggestedReferences) {
                res.json(suggestedReferences);
            })
            .catch(function (err) {
                sails.log.debug(err);
                res.badRequest(err);
            });

};

