var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsOptional, IsString, MaxLength, MinLength, } from "class-validator";
export class RegisterDto {
    email;
    password;
    displayName;
    locale;
}
__decorate([
    IsEmail(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    IsString(),
    MinLength(8),
    MaxLength(72),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    IsString(),
    MinLength(2),
    MaxLength(32),
    __metadata("design:type", String)
], RegisterDto.prototype, "displayName", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "locale", void 0);
//# sourceMappingURL=register.dto.js.map