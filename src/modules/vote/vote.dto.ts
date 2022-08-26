import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class VoteGetAllDto {
  @IsNumber() page: number;
  @IsNumber() pageSize: number;
  @IsString() site: string;
  @IsArray() order: string[];
}

export class VoteCreateDto {
  @IsString() pairing: string;
  @IsString() round: string;
  @IsString() tournament: string;
  @IsString() car: string;
  @IsOptional() @IsString() user: string;
  @IsOptional() @IsString() uuid: string;
}

export class VoteCreateFakeVotesDto {
  @IsNumber() total: number;
  @IsOptional() @IsString() round: string;
}

export class VoteGetAllOfGenericDto {
  @IsString() id: string;
  @IsString() limit: string;
  @IsOptional() site: string;
}
