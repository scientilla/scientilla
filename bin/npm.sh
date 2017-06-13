#!/usr/bin/env bash

USERID=$UID
export USERID

if [ "$1" == "test" ]; then
    docker-compose -f docker-compose-tools.yml up -d db-test
    docker-compose -f docker-compose-tools.yml run --rm npm test
else
    docker-compose -f docker-compose-tools.yml run --rm npm $*
fi