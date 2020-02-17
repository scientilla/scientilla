'user strict'

module.exports = function (req, res, next) {

    const acceptedKeys = sails.config.scientilla.APIKeys;

    if (!_.isEmpty(acceptedKeys)) {

        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization;
            const tokenParts = authorization.split(' ');

            if (tokenParts.length === 2) {

                const bearerPrefix = tokenParts[0];
                let apiKey = tokenParts[1];

                if (/^Bearer$/i.test(bearerPrefix) === false) {
                    next('Invalid API key header format. Format is Authorization: Bearer [YourApiKey]');
                }

                const foundKey = acceptedKeys.find(key => _.has(key, apiKey));

                if (foundKey) {
                    next();
                } else {
                    return res.unauthorized('Invalid API key!');
                }
            } else {
                return res.unauthorized('Invalid API key header format. Format is Authorization: Bearer [YourApiKey]');
            }
        } else {
            return res.unauthorized('API key missing, please provide Header Authorization: Bearer [YourApiKey]');
        }
    } else {
        return res.unauthorized('Please configure the API keys!');
    }
};
