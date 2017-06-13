#!/usr/bin/env bash

USERID=$UID
export USERID
docker-compose -f docker-compose-tools.yml run --rm bower $* --allow-root