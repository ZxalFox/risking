# syntax=docker/dockerfile:1

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:${NODE_VERSION} AS prod-deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile --production=true

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/app ./app
COPY --from=builder /app/src ./src
COPY --from=builder /app/middleware.ts ./middleware.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
EXPOSE 3000
CMD ["yarn", "start"]
