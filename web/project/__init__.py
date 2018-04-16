#################
#### imports ####
#################

from os.path import join, isfile
import os
import timeit

from flask import Flask, request, jsonify, Response, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
import requests
import traceback


################
#### config ####
################

app = Flask(__name__, instance_relative_config=True)


API_URL = 'http://node:1337/'

app.config.from_pyfile('flaskcfg.py')

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
        r = s.request(verb, API_URL + path, data=data, params=qs, headers=headers, cookies=cookies)
        resp = Response(r.text)
        keys = ['content-type', 'Cookie', 'scientilla-logged', 'scientilla-admin']
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
    r = requests.get(API_URL, headers=headers)
    return r.text

db = SQLAlchemy(app)

####################
#### blueprints ####
####################

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
    print(str(e))
    traceback.print_exc()
    return jsonify({
        "error": str(e) if app.config['DEBUG'] else 'Internal error'
    }), 500
