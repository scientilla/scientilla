#!/usr/bin/env bash

git reset --hard
git pull
bower install
npm install
pm2 restart app