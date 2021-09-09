
const _ = require('lodash');

module.exports = {
    getMethod
}


function getMethod(args, methods) {
    let tree = methods;
    let method = {};
    let params = [];

    for (let a of args) {
        if (_.isFunction(method)) {
            params.push(a);
            continue;
        }

        if (_.isFunction(tree[a])) {
            method = tree[a];
            continue;
        }

        if (_.isObject(tree[a]))
            tree = tree[a];
    }

    if (_.isFunction(method))
        return {
            method,
            params
        };

    throw 'wrong parameters ' + args.join(':');
}