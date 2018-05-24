FROM node:9-alpine

RUN apk update && \
 apk add --no-cache git make gcc g++ python


RUN npm install -g mocha
RUN npm install -g sails
RUN npm install -g bower
RUN npm install -g grunt
RUN npm install -g grunt-cli

WORKDIR /usr/src/app

EXPOSE 1337
EXPOSE 35732