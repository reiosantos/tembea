FROM node:10-alpine

LABEL application="tembea-backend"

ENV TERM=xterm-256color NODE_ENV=$NODE_ENV

RUN mkdir -p /usr/app
WORKDIR /usr/app
RUN npm config set unsafe-perm true
RUN npm install -g yarn@1.12.x && rm -rf package-lock.json
COPY package.json yarn.lock tsconfig.json /usr/app/
COPY .sequelizerc.build /usr/app/.sequelizerc

COPY src/ /usr/app/
RUN yarn install --only=dev
RUN yarn install
RUN yarn build
