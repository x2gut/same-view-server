import { IsNotEmpty, MinLength } from "class-validator";

export class OnUserJoinDto {
  @IsNotEmpty()
  @MinLength(4)
  username: string;

  @IsNotEmpty()
  roomId: string;
}
