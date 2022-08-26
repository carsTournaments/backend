import { IsOptional, IsString } from 'class-validator';

export class WinnerCreateDto {
  @IsString() tournament: string;
  @IsString() gold: any; // CarI;
  @IsString() silver: any; // CarI;
  @IsString() bronze: any; // CarI;
}

export class WinnerUpdateDto {
  @IsString() _id: string;
  @IsOptional() @IsString() tournament: string;
  @IsOptional() @IsString() gold: any; // CarI;
  @IsOptional() @IsString() silver: any; // CarI;
  @IsOptional() @IsString() bronze: any; // CarI;
}
