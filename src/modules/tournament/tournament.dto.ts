import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { TournamentRequisiteI } from '@tournament';
import { GetAllDto } from '@dtos';

export class TournamentGetAllDto extends GetAllDto {
  @IsOptional() @IsString() status?: string;
}

export class TournamentCreateDto {
  @IsString() name: string;
  @IsNumber() maxParticipants: number;
  @IsArray() requisites?: TournamentRequisiteI[];
  @IsString() status?: string;
}

export class TournamentUpdateDto {
  @IsOptional() @IsString() _id: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() maxParticipants?: number;
  @IsOptional() @IsNumber() durationDays?: number;
  @IsOptional() @IsArray() requisites?: TournamentRequisiteI[];
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
}

export class TournamentInscriptionDto {
  @IsString() tournamentId: string;
  @IsString() car: string;
}

export class TournamentForceNextRoundDto {
  @IsString() tournamentId: string;
}
