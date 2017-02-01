#!/usr/bin/env bash

git pull
bower install
npm install
pm2 restart app