/**
 * SuggestionController
 *
 * @description :: Server-side logic for managing suggestions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
        find: function (req, res) {
            console.log('find!!');
            var documentId = req.params.id;
            Suggestion
                    .getSuggestion(documentId)
                    .then(function(suggestion){
                        console.log(suggestion);
                        res.json(suggestion);
            });
        }
};

