FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/app/package.json ./packages/app/
COPY packages/server/package.json ./packages/server/
COPY vendor ./vendor

RUN npm ci

COPY . .

RUN npm run build -w app
RUN npm run build -w server


FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/packages/server/package.json ./packages/server/

COPY --from=builder /usr/src/app/vendor ./vendor

RUN npm ci --omit=dev --filter=server

COPY --from=builder /usr/src/app/packages/server/dist ./packages/server/dist
COPY --from=builder /usr/src/app/packages/app/dist ./packages/server/public

ENV STATIC=./packages/server/public

EXPOSE 3000

CMD ["node", "packages/server/dist/index.js"]