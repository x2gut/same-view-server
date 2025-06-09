import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from './schemas/create-room.schema';
import { Model } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import generateRoomKey from 'src/shared/utils/generateRoomKey';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDocument } from './document/room.document';
import { RoomNotFoundException } from './exceptions/roomNotFound.exception';
import { InvalidRoomPasswordException } from './exceptions/invalidRoomPassword.exception';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name)
    private roomModel: Model<RoomDocument>,
  ) {}

  async createRoom(data: CreateRoomDto) {
    const roomId = uuidV4();
    const roomKey = generateRoomKey(8);

    const room = {
      roomId: roomId,
      roomKey: roomKey,
      ...data,
    };

    return await this.roomModel.create(room);
  }

  async getRoomByKey(key: string, password?: string) {
    const room = await this.roomModel.findOne({ roomKey: key }).lean();
    
    if (!room) {
      throw new RoomNotFoundException();
    }

    const isPrivate = !!room?.password;

    if (isPrivate && password !== room.password) {
      throw new InvalidRoomPasswordException();
    }

    delete room?.password;

    return {
      isPrivate: isPrivate,
      ...room,
    };
  }

  async setNewVideoUrl(roomId: string, videoUrl: string) {
    const room = await this.roomModel.findOne({ roomId: roomId });

    if (!room) {
      throw new RoomNotFoundException();
    }

    await this.roomModel.updateOne(
      { roomId },
      {
        $set: { 'video.url': videoUrl },
      },
    );
  }
}
