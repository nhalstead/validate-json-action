FROM node:20-alpine AS base
WORKDIR /service

FROM base AS dependencies
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

FROM dependencies AS build
COPY . ./
RUN npm run build

FROM base AS release
COPY --from=build /service/node_modules /service/node_modules
COPY --from=build /service/lib /service/lib
COPY --from=build /service/package.json /service
ENV NODE_ENV=production

ENTRYPOINT [ "node", "/service/lib/main.js" ]
