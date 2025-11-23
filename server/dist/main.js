import "./env-defaults.js";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AppModule } from "./app.module.js";
async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.useWebSocketAdapter(new IoAdapter(app));
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const configService = app.get(ConfigService);
    const port = configService.get("PORT", 4000);
    await app.listen(port);
    const url = await app.getUrl();
    console.log(`Risking API running at ${url}`);
}
bootstrap().catch((error) => {
    console.error("Failed to start Risking API:", error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map