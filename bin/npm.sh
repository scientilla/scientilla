#!/usr/bin/env bash

if [ "$1" == "test" ]; then
    docker-compose -f docker-compose-tools.yml up -d db-test
    docker-compose -f docker-compose-tools.yml run --rm mocha test/bootstrap.test.js test/integration/bootstrap.test.js test/**/*.test.js
else
    USERID=$UID
    export USERID
    docker-compose -f docker-compose-tools.yml run --rm npm $*
fi