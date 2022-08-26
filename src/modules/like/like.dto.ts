import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LikeGetAllOfCarDto {
  @IsString() id: string;
  @IsString() limit: string;
}

export class LikeCreateDto {
  @IsString() car: string;
  @IsOptional() @IsString() user: string;
}

export class LikeCreateFakeDto {
  @IsNumber() total: number;
  @IsOptional() @IsString() carId?: string;
}
