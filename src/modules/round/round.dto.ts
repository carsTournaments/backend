import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class RoundCreateAutomaticsRoundsDto {
  @IsString() tournamentId: string;
}

export class RoundUpdateDto {
  @IsOptional() @IsString() _id: string;
  @IsOptional() @IsString() name: string;
  @IsOptional() @IsNumber() participants: number;
  @IsOptional() @IsString() tournament: any; // TournamentI
  @IsOptional() @IsString() startDate: string;
  @IsOptional() @IsString() endDate: string;
  @IsBoolean() @IsString() finished: string;
}
