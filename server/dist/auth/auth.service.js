var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, Injectable, UnauthorizedException, } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import argon2 from "argon2";
import { UsersService } from "../users/users.service.js";
let AuthService = class AuthService {
    usersService;
    jwtService;
    accessTtl;
    refreshTtl;
    accessSecret;
    refreshSecret;
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.accessTtl = configService.get("JWT_EXPIRES_IN", "15m");
        this.refreshTtl = configService.get("JWT_REFRESH_EXPIRES_IN", "7d");
        this.accessSecret = configService.get("JWT_SECRET", "change-me");
        this.refreshSecret = configService.get("JWT_REFRESH_SECRET", "change-me-too");
    }
    async register(dto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new BadRequestException("Email already registered");
        }
        const passwordHash = await argon2.hash(dto.password);
        const user = await this.usersService.create({
            email: dto.email,
            passwordHash,
            displayName: dto.displayName,
            locale: dto.locale ?? "pt-BR",
        });
        return this.issueTokens(user);
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }
        const passwordValid = await argon2.verify(user.passwordHash, dto.password);
        if (!passwordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return this.issueTokens(user);
    }
    async refreshTokens(dto) {
        const payload = await this.verifyRefreshToken(dto.refreshToken);
        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        const matches = await argon2.verify(user.refreshTokenHash, dto.refreshToken);
        if (!matches) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        return this.issueTokens(user);
    }
    async issueTokens(user) {
        const accessPayload = {
            sub: user.id,
            displayName: user.displayName ?? undefined,
            locale: user.locale ?? undefined,
        };
        const refreshPayload = {
            sub: user.id,
        };
        const accessOptions = {
            secret: this.accessSecret,
            expiresIn: this.accessTtl,
        };
        const refreshOptions = {
            secret: this.refreshSecret,
            expiresIn: this.refreshTtl,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload, accessOptions),
            this.jwtService.signAsync(refreshPayload, refreshOptions),
        ]);
        await this.usersService.update(user.id, {
            refreshTokenHash: await argon2.hash(refreshToken),
        });
        return { accessToken, refreshToken };
    }
    verifyRefreshToken(token) {
        return this.jwtService.verifyAsync(token, {
            secret: this.refreshSecret,
        });
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map