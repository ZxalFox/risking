import { IsOptional, IsString, IsUUID } from "class-validator";

export class AttackTurnDto {
  @IsUUID()
  defenderId!: string;

  @IsUUID()
  riskCardId!: string;

  @IsOptional()
  @IsString()
  riskNarrative?: string;
}
