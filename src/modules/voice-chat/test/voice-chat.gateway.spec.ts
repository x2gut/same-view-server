import { Test, TestingModule } from '@nestjs/testing';
import { VoiceChatGateway } from '../voice-chat.gateway';
import { VoiceChatService } from '../voice-chat.service';

describe('VoiceChatGateway', () => {
  let gateway: VoiceChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoiceChatGateway, VoiceChatService],
    }).compile();

    gateway = module.get<VoiceChatGateway>(VoiceChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
