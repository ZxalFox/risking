# Risking API

NestJS/Prisma backend that powers the online Risking experience. The stack matches the architecture defined in `../docs/backend-architecture.md`.

## Getting Started

```bash
cd server
corepack enable
yarn install

# Start the backing services (once per machine)
docker compose up -d db redis

# Apply migrations and start the API with live reload
yarn prisma:migrate
yarn start:dev
```

The API ships with sensible defaults for local development (PostgreSQL on `localhost:5432`, Redis on `localhost:6379`). Start them with Docker as shown above or point the environment variables to your own instances. When the API boots it will reuse the defaults if variables are missing; override them in a `.env` file for custom setups.

## Available Scripts

- `yarn start:dev` – run the NestJS app with hot-reload (`prisma generate` runs automatically on install).
- `yarn build` – compile TypeScript to `dist/` (runs `prisma generate` first).
- `yarn start` / `yarn start:prod` – execute the compiled bundle (`yarn start:prod` runs `prisma migrate deploy` before launching).
- `yarn prisma:migrate` – apply development migrations (`prisma migrate dev`).
- `yarn prisma:generate` – regenerate the Prisma client when the schema changes.

## Modules

- **AuthModule** – registration, login, refresh tokens (JWT + Argon2 hashing).
- **SessionsModule** – lobby lifecycle (create, list, join, start, leave) and websocket broadcasting. Turn resolution endpoints are scaffolded and will be completed next.
- **PrismaModule** – shared Prisma client with graceful shutdown hooks.

## Environment Variables

See `.env.example` for the required variables. The application provides development fallbacks, but you should set explicit values before deploying to production.
