import { Module } from '@nestjs/common';
import { VoiceChatService } from './voice-chat.service';
import { VoiceChatGateway } from './voice-chat.gateway';

@Module({
  providers: [VoiceChatGateway, VoiceChatService],
})
export class VoiceChatModule {}
