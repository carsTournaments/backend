import { IsString } from 'class-validator';

export class InscriptionCreateDto {
  @IsString() car: string;
  @IsString() tournament: string;
  @IsString() driver: string;
}

export class InscriptionGetMyCarsForInscriptionDto {
  @IsString() userId: string;
  @IsString() tournamentId: string;
}

export class InscriptionGetAllOfCarDto {
  @IsString() id: string;
  @IsString() limit: string;
}
