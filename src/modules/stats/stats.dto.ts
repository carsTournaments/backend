import { IsString } from 'class-validator';

export class StatsGetResumeDto {
  @IsString() type: string;
}
