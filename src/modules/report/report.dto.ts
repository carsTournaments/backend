import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReportCreateDto {
  @IsString() userReporter: string;
  @IsString() userReported: string;
  @IsString() carReported: string;
  @IsString() reason: string;
  @IsBoolean() state: boolean;
}

export class ReportUpdateDto {
  @IsOptional() @IsString() _id: string;
  @IsOptional() @IsString() userReporter: string;
  @IsOptional() @IsString() userReported: string;
  @IsOptional() @IsString() carReported: string;
  @IsOptional() @IsString() reason: string;
  @IsOptional() @IsBoolean() state: boolean;
}

export class ReportGetAllForUserDto {
  userId: string;
  type: string;
}
