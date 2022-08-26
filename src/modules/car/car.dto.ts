import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { GetAllDto } from '../../common/dtos/generic.dto';

export class CarGetAllDto extends GetAllDto {
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsBoolean() onlyWithPhoto?: boolean;
}

export class CarGetGlobalRankingDto {
  @IsNumber() limit: number;
  @IsString() order: string;
}

export class CarCreateDto {
  @IsString() driver: any; // UserI
  @IsString() brand: any; // BrandI
  @IsString() model: string; // BrandI
  @IsString() traction: string;
  @IsString() fuel: string;
  @IsNumber() cv: number;
  @IsNumber() cc: number;
  @IsNumber() year: number;
  @IsBoolean() stock: boolean;
  @IsOptional() @IsString() info?: string;
}

export class CarCreateFakeDto {
  @IsNumber() total: number;
}

export class CarUpdateDto {
  @IsOptional() @IsString() _id: string;
  @IsOptional() @IsString() driver: any; // UserI
  @IsOptional() @IsString() brand: any; // BrandI
  @IsOptional() @IsString() traction: string;
  @IsOptional() @IsString() fuel: string;
  @IsOptional() @IsNumber() cv: number;
  @IsOptional() @IsNumber() cc: number;
  @IsOptional() @IsBoolean() stock: boolean;
  @IsOptional() @IsNumber() year: number;
  @IsOptional() @IsString() info: string;
}
