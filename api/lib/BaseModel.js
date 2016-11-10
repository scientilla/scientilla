module.exports = {

    attributes: {
        savePromise: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.save(function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(self);
                });
            });
        }
    },

};