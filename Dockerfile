# syntax=docker/dockerfile:1
FROM node:current-alpine AS build

RUN apk add --no-cache python3 make build-base

# ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install # --production

# This results in a single layer image
FROM node:current-alpine

RUN adduser -u 10000 -h /app -D -S nyats
USER nyats

COPY --from=build /app/node_modules /app/node_modules

WORKDIR /app
COPY . .

CMD ["start"]
ENTRYPOINT ["npm"]
