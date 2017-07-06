#!/usr/bin/env bash

git reset --hard
git pull
chmod u+x ./bin/deploy.sh
bower install
npm install
pm2 restart app