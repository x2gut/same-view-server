// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './room/room.module';
import { ChatModule } from './chat/chat.module';
import { VideoViewerModule } from './video-viewer/video-viewer.module';
import { VoiceChatModule } from './voice-chat/voice-chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL || ''),
    RoomModule,
    ChatModule,
    VideoViewerModule,
    VoiceChatModule,
  ],
})
export class AppModule {}
