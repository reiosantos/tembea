FROM node:10-alpine

LABEL application="tembea-backend"

ENV TERM=xterm-256color

RUN mkdir -p /usr/app
WORKDIR /usr/app

RUN npm install -g yarn@1.17.x tslint typescript && rm -rf package-lock.json
COPY package.json yarn.lock .sequelizerc .eslintrc.json tsconfig.json tsconfig.build.json tslint.json jest.config.js /usr/app/
RUN yarn install

COPY src /usr/app/src
COPY integrations /usr/app/integrations
COPY docker/tests/entrypoint.sh /usr/app
