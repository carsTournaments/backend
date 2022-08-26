import { IsString } from 'class-validator';

export class OtaGetOtaAvailable {
  @IsString() cap_platform: string;
  @IsString() cap_device_id: string;
  @IsString() cap_app_id: string;
  @IsString() cap_version_build: string;
  @IsString() cap_plugin_version: string;
  @IsString() cap_version_name: string;
}

export class OtaCreateDto {
  @IsString() platform: string;
  @IsString() version: string;
}
