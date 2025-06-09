import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @MinLength(4)
  @MaxLength(20)
  readonly roomName: string;

  @ApiProperty()
  @MinLength(4)
  @MaxLength(20)
  readonly hostName: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(8)
  @MaxLength(32)
  readonly password?: string;
}
