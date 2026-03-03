FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable
RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:22-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN apk add --no-cache python3 make g++ \
    && yarn workspaces focus --production \
    && apk del python3 make g++

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -d dist/src/config/db.config.js && node dist/src/main"]
