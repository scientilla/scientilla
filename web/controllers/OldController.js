const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

module.exports = {
    relay: (req, res) => {
        proxy.web(req, res, {target: 'http://node:1337'});
    }
};