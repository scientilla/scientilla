_ = require('lodash');

module.exports = {
    start: () => {
        const express = require('express');
        const bodyParser = require('body-parser');
        const app = express();

        const router = express.Router({});

        const methods = [
            'all',
            'get',
            'post',
            'delete',
            'put',
            'head',
            'connect',
            'options',
            'trace',
            'patch'
        ];

        Object.keys(configs.routes).forEach(key => {
            const method = key.split(' ')[0].toLocaleLowerCase();
            const path = key.split(' ')[1];

            if (!methods.includes(method))
                throw 'Invalid route configuration ' + key;

            router[method](path, _.get(global, configs.routes[key]));

            if (path !== '/*') {
                app.use(path, bodyParser.json());
                app.use(path, bodyParser.urlencoded({extended: true}));
            }
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