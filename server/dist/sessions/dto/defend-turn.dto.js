var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";
export class DefendTurnDto {
    mitigationCardId;
    mitigationText;
}
__decorate([
    ValidateIf((o) => !o.mitigationText),
    IsUUID(),
    __metadata("design:type", String)
], DefendTurnDto.prototype, "mitigationCardId", void 0);
__decorate([
    ValidateIf((o) => !o.mitigationCardId),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], DefendTurnDto.prototype, "mitigationText", void 0);
//# sourceMappingURL=defend-turn.dto.js.map