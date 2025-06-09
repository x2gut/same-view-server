import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Room {
  @Prop({ unique: true })
  roomId: string;

  @Prop({ unique: true })
  roomKey: string;

  @Prop({ required: true })
  roomName: string;

  @Prop({ required: true })
  hostName: string;

  @Prop()
  password?: string;

  @Prop({
    type: {
      url: { type: String, default: undefined },
      timecode: { type: String, default: undefined },
    },
  })
  video: {
    url?: string;
    timecode?: string;
  };
}

export const RoomSchema = SchemaFactory.createForClass(Room);
