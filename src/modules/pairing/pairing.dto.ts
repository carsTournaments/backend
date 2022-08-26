import { IsString, IsOptional, IsArray } from 'class-validator';

export class PairingCreateAutomaticsPairingsDto {
  @IsString() roundId: string;
}

export class PairingUpdateDto {
  @IsOptional() @IsString() _id: string;
  @IsOptional() @IsString() round: string;
  @IsOptional() @IsString() tournament: string;
  @IsOptional() @IsArray() car1: string;
  @IsOptional() @IsArray() car2: string;
  @IsOptional() @IsArray() votes1: number;
  @IsOptional() @IsArray() votes2: number;
  @IsOptional() @IsString() winner: string;
}
