import { IsOptional, IsString } from 'class-validator';

export class LogGetAllDto {
  @IsString() type: string;
  @IsString() @IsOptional() order: string;
}
