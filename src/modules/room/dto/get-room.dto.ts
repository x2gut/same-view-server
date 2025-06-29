import { IsNotEmpty, IsOptional, MinLength } from "class-validator"

export class GetRoomDto {
    @IsNotEmpty()
    @MinLength(4)
    username: string

    @IsOptional()
    password?: string
}