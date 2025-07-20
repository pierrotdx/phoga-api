# https://docs.docker.com/language/nodejs/containerize/

ARG NODE_VERSION=20.3.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

RUN ["mkdir", "-p",  "/home/node/app/node_modules"]

RUN ["chown", "-R", "node:node", "/home/node/app"]

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN ["npm", "ci"]

COPY --chown=node:node . .

EXPOSE 3000

RUN ["npm", "run", "build:ci"]

CMD ["npm", "run", "start"]
