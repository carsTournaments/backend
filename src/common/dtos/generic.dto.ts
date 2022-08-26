import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class IdDto {
  @IsString() id: string;
}

export class IdSiteDto {
  @IsString() id: string;
  @IsOptional() @IsString() site: string;
}

export class GetAllDto {
  @IsNumber() page: number;
  @IsNumber() pageSize: number;
  @IsString() site: string;
  @IsArray() order: string[];
}

export class SiteDto {
  @IsString() site: string;
}

export class SearchDto {
  @IsString() value: string;
  @IsOptional() @IsNumber() limit: number;
}
