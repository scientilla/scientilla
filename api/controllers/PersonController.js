module.exports = {
    getUniqueRoleCategories(req, res, next) {
        res.halt(Person.getUniqueRoleCategories());
    },

    getUniqueNationalities(req, res, next) {
        res.halt(Person.getUniqueNationalities());
    }
};