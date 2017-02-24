FROM node:7.6

RUN apt-get update & apt-get install git

RUN npm install -g mocha
RUN npm install -g sails
RUN npm install -g bower
RUN npm install -g grunt

WORKDIR /usr/src/app

EXPOSE 1337
EXPOSE 35732