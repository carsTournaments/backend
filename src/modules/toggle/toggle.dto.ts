import { IsBoolean, IsString } from 'class-validator';

export class ToggleCreateDto {
  @IsString() name: string;
  @IsBoolean() state: boolean;
  @IsString() description: string;
}

export class ToggleUpdateDto {
  @IsString() _id: string;
  @IsString() name: string;
  @IsBoolean() state: boolean;
  @IsString() description: string;
}
