FROM node:lts AS build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . ./

RUN npm run build

USER node

# Second stage (getting the "node_modules" directory)
FROM node:lts AS node_modules

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

USER node

# The last stage 🚀 (putting it all together)
FROM node:lts AS production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=node_modules /usr/src/app/node_modules ./node_modules

COPY . ./

RUN git clone https://github.com/vishnubob/wait-for-it.git

CMD [ "npm", "run", "start:prod:api" ]
