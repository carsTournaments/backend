import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { GetAllDto } from '../../common/dtos/generic.dto';

export class BrandGetAllDto extends GetAllDto {
  @IsOptional() @IsArray() select: string[];
}

export class BrandGetAllBrandsAndCarsDto {
  @IsNumber() page: number;
  @IsNumber() pageSize: number;
  @IsOptional() @IsBoolean() onlyWithPhoto?: boolean;
  @IsArray() order: string[];
}

export class BrandCreateDto {
  @IsString() name: string;
  @IsString() country: string;
  @IsString() continent: string;
}

export class BrandUpdateDto {
  @IsOptional() @IsString() _id: string;
  @IsOptional() @IsString() name: string;
  @IsOptional() @IsString() country: string;
  @IsOptional() @IsString() continent: string;
}
