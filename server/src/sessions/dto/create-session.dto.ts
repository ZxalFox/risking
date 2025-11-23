import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateSessionDto {
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(5)
  maxPlayers?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  roundCount?: number;

  @IsOptional()
  @IsString()
  locale?: string;
}
