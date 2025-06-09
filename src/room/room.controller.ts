import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ApiTags } from '@nestjs/swagger';
import { RoomNotFoundException } from './exceptions/roomNotFound.exception';
import { InvalidRoomPasswordException } from './exceptions/invalidRoomPassword.exception';
import { CreateRoomResponse } from './responses/create-room.response';
import { SetNewVideoUrl } from './dto/set-new-video.dto';

@Controller('room')
@ApiTags('Room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/new')
  @HttpCode(201)
  async createRoom(@Body() data: CreateRoomDto): Promise<CreateRoomResponse> {
    const roomData = await this.roomService.createRoom(data);
    return {
      message: 'Room created succesfully',
      data: {
        roomName: roomData.roomName,
        roomKey: roomData.roomKey,
        roomId: roomData.roomId,
        isPrivate: !!roomData.password,
      },
    };
  }

  @Get('/key/:key')
  async getRoomByKey(
    @Param('key') key: string,
    @Query() data?: { username: string; password: string },
  ) {
    try {
      const roomData = await this.roomService.getRoomByKey(key, data?.password);
      return {
        data: roomData,
      };
    } catch (error) {
      if (error instanceof RoomNotFoundException) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
      if (error instanceof InvalidRoomPasswordException) {
        throw new HttpException(
          'Invalid room password',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw error;
    }
  }

  @Post('/set/video')
  @HttpCode(200)
  async setNewVideoUrl(@Body() data: SetNewVideoUrl) {
    const { roomId, videoUrl } = data;
    try {
      await this.roomService.setNewVideoUrl(roomId, videoUrl);

      return {
        message: 'success',
      };
    } catch (error) {
      if (error instanceof RoomNotFoundException) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
    }
  }
}
