const isProduction = process.env.NODE_ENV === "production";
if (!process.env.PORT) {
    process.env.PORT = "4000";
}
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "change-me";
}
if (!process.env.JWT_REFRESH_SECRET) {
    process.env.JWT_REFRESH_SECRET = "change-me-too";
}
if (!isProduction) {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL =
            "postgres://postgres:postgres@localhost:5432/risking";
    }
    if (!process.env.REDIS_URL) {
        process.env.REDIS_URL = "redis://localhost:6379";
    }
}
export {};
//# sourceMappingURL=env-defaults.js.map