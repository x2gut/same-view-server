import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SetNewVideoUrl {
  @ApiProperty()
  @IsNotEmpty()
  readonly roomId: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly videoUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly username: string;
}
