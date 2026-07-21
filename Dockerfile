FROM node:26-alpine AS base
WORKDIR /service

FROM base AS npm-source
COPY package.json package-lock.json tsconfig.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM npm-source AS build
COPY . ./
RUN npm run build

FROM base AS release
COPY --from=build /service/node_modules /service/node_modules
COPY --from=build /service/dist /service/dist
COPY --from=build /service/package.json /service
ENV NODE_ENV=production

ENTRYPOINT [ "node", "/service/dist/main.js" ]
