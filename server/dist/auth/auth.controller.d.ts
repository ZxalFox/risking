import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshDto } from "./dto/refresh.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./auth.service.js").AuthTokens>;
    login(dto: LoginDto): Promise<import("./auth.service.js").AuthTokens>;
    refresh(dto: RefreshDto): Promise<import("./auth.service.js").AuthTokens>;
}
