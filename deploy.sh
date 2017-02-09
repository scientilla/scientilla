#!/usr/bin/env bash

git revert --hard
git pull
bower install
npm install
pm2 restart app