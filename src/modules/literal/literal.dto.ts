import { IsString } from 'class-validator';

export class LiteralCreateDto {
  @IsString() name: string;
  @IsString() category: string;
  @IsString() es: number;
  @IsString() en: string;
}

export class LiteralUpdateDto {
  @IsString() _id: string;
  @IsString() name: string;
  @IsString() category: string;
  @IsString() es: number;
  @IsString() en: string;
}

export class LiteralGetAllForLanguageDto {
  @IsString() language: string;
}
