import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class NotificationUpdateFCMForUserDto {
  @IsString() id: string;
  @IsString() token: string;
}

export class NotificationCreateDto {
  @IsArray() users: string[];
  @IsArray() fcms: string[];
  @IsString() title: string;
  @IsString() message: string;
  @IsOptional() @IsObject() data?: any;
}
