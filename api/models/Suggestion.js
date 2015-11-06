/**
 * Suggestion.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var _ = require('lodash');


module.exports = {
    attributes: {
    },
    getSuggestion: function (referenceId) {
        return Promise.all([
            Reference.findOne(referenceId).populate('collaborators'),
            User.find()
        ])
                .then(function (results) {
                    console.log('ok');
                    var reference = results[0];
                    var users = results[1];
                    var authors = reference.getUcAuthors();
                    console.log(authors);
                    var possibleAuthors = _.filter(
                            users,
                            function (u) {
                                var aliases = u.getUcAliases();
                                return !_.isEmpty(_.intersection(aliases, authors));
                            }
                    );
                    console.log(possibleAuthors);
                    var collaboratorsId = _.map(reference.collaborators, "id");
                    console.log(collaboratorsId);
                    var suggestedUsers = _.reject(
                            possibleAuthors,
                            function (u) {
                                return u.id === reference.owner
                                        || _.includes(collaboratorsId, u.id);
                            }
                    );
                    console.log(suggestedUsers);
                    
                    //TODO: search by aliases
                    //select *  from reference where authors ilike any (select '%' || str || '%' from alias)
                    return {users: suggestedUsers};
                });

    }
};

