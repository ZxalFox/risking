import { IsBoolean, IsOptional } from "class-validator";

export class JoinSessionDto {
  @IsOptional()
  @IsBoolean()
  asSpectator?: boolean;
}
