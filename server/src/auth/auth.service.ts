import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import argon2 from "argon2";
import type { StringValue } from "ms";
import { UsersService } from "../users/users.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshDto } from "./dto/refresh.dto.js";
import { RegisterDto } from "./dto/register.dto.js";

type AuthUser = NonNullable<Awaited<ReturnType<UsersService["findById"]>>>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly accessTtl: StringValue;
  private readonly refreshTtl: StringValue;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    configService: ConfigService
  ) {
    this.accessTtl = configService.get<string>(
      "JWT_EXPIRES_IN",
      "15m"
    ) as StringValue;
    this.refreshTtl = configService.get<string>(
      "JWT_REFRESH_EXPIRES_IN",
      "7d"
    ) as StringValue;
    this.accessSecret = configService.get<string>("JWT_SECRET", "change-me");
    this.refreshSecret = configService.get<string>(
      "JWT_REFRESH_SECRET",
      "change-me-too"
    );
  }

  async register(dto: RegisterDto): Promise<AuthTokens> {
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

  async login(dto: LoginDto): Promise<AuthTokens> {
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

  async refreshTokens(dto: RefreshDto): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const matches = await argon2.verify(
      user.refreshTokenHash,
      dto.refreshToken
    );
    if (!matches) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: AuthUser): Promise<AuthTokens> {
    const accessPayload = {
      sub: user.id,
      displayName: user.displayName ?? undefined,
      locale: user.locale ?? undefined,
    } satisfies Record<string, unknown>;

    const refreshPayload = {
      sub: user.id,
    } satisfies Record<string, unknown>;

    const accessOptions = {
      secret: this.accessSecret,
      expiresIn: this.accessTtl,
    } satisfies JwtSignOptions;

    const refreshOptions = {
      secret: this.refreshSecret,
      expiresIn: this.refreshTtl,
    } satisfies JwtSignOptions;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, accessOptions),
      this.jwtService.signAsync(refreshPayload, refreshOptions),
    ]);

    await this.usersService.update(user.id, {
      refreshTokenHash: await argon2.hash(refreshToken),
    });

    return { accessToken, refreshToken };
  }

  private verifyRefreshToken(token: string): Promise<{ sub: string }> {
    return this.jwtService.verifyAsync<{ sub: string }>(token, {
      secret: this.refreshSecret,
    });
  }
}
