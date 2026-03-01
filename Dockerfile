FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:22-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock .yarnrc.yml ./
RUN apk add --no-cache python3 make g++ \
    && yarn install --frozen-lockfile --production \
    && apk del python3 make g++

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -d dist/config/db.config.js && node dist/main"]
