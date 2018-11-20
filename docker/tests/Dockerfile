FROM node:10-alpine

LABEL application="testing-tembea-backend"

ENV TERM=xterm-256color

RUN mkdir -p /usr/app
WORKDIR /usr/app

RUN npm install -g yarn@1.12.x && rm -rf package-lock.json
COPY package.json yarn.lock .sequelizerc .eslintrc.json .babelrc /usr/app/
RUN yarn install

COPY src /usr/app/src
COPY docker/tests/entrypoint.sh /usr/app