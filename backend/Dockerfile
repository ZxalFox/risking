FROM node:22-alpine AS build

WORKDIR /app
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
RUN yarn install --frozen-lockfile

COPY backend/ ./backend/
WORKDIR /app/backend
RUN yarn build

FROM node:22-alpine AS production

WORKDIR /app
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
RUN yarn install --frozen-lockfile --production

COPY --from=build /app/backend/dist ./backend/dist

WORKDIR /app/backend
EXPOSE 3001

CMD ["node", "dist/main"]
