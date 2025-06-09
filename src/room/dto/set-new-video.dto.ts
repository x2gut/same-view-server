import { ApiProperty } from '@nestjs/swagger';

export class SetNewVideoUrl {
  @ApiProperty()
  readonly roomId: string;

  @ApiProperty()
  readonly videoUrl: string;

  @ApiProperty()
  readonly username: string;
}
