/**
 * 401 (Unauthorized Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(data);
 *
 * e.g.:
 * ```
 * return res.unauthorized(
 *   'Invalid API key!',
 * );
 * ```
 */

module.exports = function unauthorized(data) {

    // Get access to `req`, `res`, & `sails`
    var req = this.req;
    var res = this.res;
    var sails = req._sails;

    // Set status code
    res.status(401);

    // Log error to console
    if (data !== undefined) {
        sails.log.verbose('Sending 401 ("Unauthorized Request") response: \n',data);
    }
    else sails.log.verbose('Sending 401 ("Unauthorized Request") response');

    return res.jsonx({
        message: data
    });
};

