module.exports = {
    start: () => {
        const express = require('express');
        const httpProxy = require('http-proxy');
        const proxy = httpProxy.createProxyServer();
        const app = express();

        const router = express.Router({});

        router.all('/*', async (req, res) => {
            proxy.web(req, res, {target: 'http://node:1337'});
        });

        app.use(router);

        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            const err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // error handler
        app.use(function (err, req, res) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500)
                .send('<html><body><pre>' + err.stack + '</pre></body></html>')
        });

        app.listen(1337);

        return app;
    }
};