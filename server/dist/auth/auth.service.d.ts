import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshDto } from "./dto/refresh.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly accessTtl;
    private readonly refreshTtl;
    private readonly accessSecret;
    private readonly refreshSecret;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<AuthTokens>;
    login(dto: LoginDto): Promise<AuthTokens>;
    refreshTokens(dto: RefreshDto): Promise<AuthTokens>;
    private issueTokens;
    private verifyRefreshToken;
}
