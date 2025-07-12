import { Test, TestingModule } from '@nestjs/testing';
import { VoiceChatService } from './voice-chat.service';

describe('VoiceChatService', () => {
  let service: VoiceChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoiceChatService],
    }).compile();

    service = module.get<VoiceChatService>(VoiceChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
