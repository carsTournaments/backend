import { IsOptional, IsString } from 'class-validator';

export class SettingsCheckUpdateDto {
  @IsString() platform: string;
  @IsString() version: string;
}

export class SettingsAppDto {
  @IsOptional() @IsString() platform: string;
  @IsOptional() @IsString() version: string;
}
