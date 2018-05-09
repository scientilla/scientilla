#################
#### imports ####
#################

from os.path import join, isfile
import os
import timeit

from flask import Flask, request, jsonify, Response, send_from_directory, send_file
import requests
import traceback
from project.serializers import ma
from project.models import db


################
#### config ####
################

app = Flask(__name__, instance_relative_config=True)


def create_app():

    app = Flask(__name__, instance_relative_config=True)

    config_filename ='flaskcfg_test.py' if os.environ['FLASK_ENV'] == 'test' else 'flaskcfg.py'

    app.config.from_pyfile(config_filename)

    @app.route("/<path:path>", methods = ['GET', 'POST', 'DELETE', 'PUT'])
    def catch_all(path):
        verb = request.method
        data = request.data
        headers = {}
        keys = ['access_token', 'content-type', 'Accept-Encoding', 'scientilla-logged', 'scientilla-admin', 'Host']
        for key in keys:
            if key in request.headers:
                headers[key] = request.headers[key]
        qs = request.query_string
        cookies = request.cookies
        with requests.Session() as s:
            r = s.request(verb, app.config['API_URL'] + path, data=data, params=qs, headers=headers, cookies=cookies)
            resp = Response(r.text)
            keys = ['content-type', 'Cookie', 'scientilla-logged', 'scientilla-admin', 'set-cookie']
            for key in keys:
                if key in r.headers:
                    resp.headers[key] = r.headers[key]
            return resp

    @app.route('/favicon.ico', defaults={'prefix': '', 'path': 'favicon.ico'})
    @app.route('/<any("js", "styles", "images", "partials"):prefix>/<path:path>')
    def static_files(prefix, path):
        if request.path.endswith('.map'):
            return ''
        filepath = 'static/public' + request.path
        return send_file(filepath)

    @app.route('/')
    def homepage():
        headers = {'Content-Type': 'text/html'}
        r = requests.get(app.config['API_URL'], headers=headers)
        return r.text

    db.init_app(app)
    ma.init_app(app)


    ####################
    #### blueprints ####
    ####################

    from project.research_entity.views import research_entity_blueprint

    # register the blueprints
    app.register_blueprint(research_entity_blueprint)

    ############################
    #### custom error pages ####
    ############################


    @app.errorhandler(404)
    def page_not_found(e):
        return jsonify({
            "error": 'Element not found'
        }), 404

    @app.errorhandler(Exception)
    def exception_handler(e):
        # print(str(e))
        traceback.print_exc()
        return jsonify({
            "error": str(e) if app.config['DEBUG'] else 'Internal error'
        }), 500

    return app
