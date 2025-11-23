import { IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";

export class DefendTurnDto {
  @ValidateIf((o) => !o.mitigationText)
  @IsUUID()
  mitigationCardId?: string;

  @ValidateIf((o) => !o.mitigationCardId)
  @IsString()
  @IsOptional()
  mitigationText?: string;
}
