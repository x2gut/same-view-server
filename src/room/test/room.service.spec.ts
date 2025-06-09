import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from '../room.service';
import * as dotenv from 'dotenv';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '../schemas/create-room.schema';
import mongoose, { Model } from 'mongoose';

dotenv.config({ path: '.env.dev' });

describe('RoomService', () => {
  let service: RoomService;
  let roomModel: Model<Room>;
  let roomData: Room;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGO_URL || ''),
        MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
      ],
      providers: [RoomService],
    }).compile();

    service = module.get<RoomService>(RoomService);
    roomModel = module.get<Model<Room>>(getModelToken(Room.name));
  });

  beforeEach(async () => {
    await roomModel.deleteMany();

    roomData = await service.createRoom({
      roomName: 'test',
      hostName: 'test',
      password: 'test',
    });
  });

  afterAll(async () => {
    await roomModel.deleteMany();
    await mongoose.disconnect();
  });

  it('should throw if password incorrect', async () => {
    await expect(
      service.getRoomByKey(roomData.roomKey, 'wrongpassword'),
    ).rejects.toThrow();
  });

  it('should throw if room does not exists', async () => {
    await expect(service.getRoomByKey('notexist', 'test')).rejects.toThrow();
  });

  it('should set video url or change it', async () => {
    const videoUrl = 'www.youtube.com/watch/123';
    await service.setNewVideoUrl(roomData.roomId, videoUrl);

    const res = await service.getRoomByKey(roomData.roomKey, 'test');

    expect(res.video.url).toEqual(videoUrl);
    expect(res.video.timecode).toEqual('0');
  });

  it('should return room if roomkey and password are correct', async () => {
    const result = await service.getRoomByKey(roomData.roomKey, 'test');

    expect(result).toBeDefined();
    expect(result.isPrivate).toBe(true);
    expect(result.password).toBe(undefined);
  });
});
