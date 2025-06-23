import { Test } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { ChatService } from '../chat.service';
import { UsersLimitPerRoomExceeded } from '../exceptions/usersLimitPerRoomExceeded';

dotenv.config({ path: '.env.dev' });

describe('ChatService', () => {
  let chatService: ChatService;
  const mockData = { username: 'John', roomId: 'testId' };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ChatService],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
  });

  beforeEach(async () => {
    (chatService as any).rooms = new Map<string, Set<string>>();

    (chatService as any).rooms.set(
      mockData.roomId,
      new Set().add(mockData.username),
    );
  });

  describe('User Connection', () => {
    it('should add user to room', async () => {
      const mockData2 = { roomId: 'testId2', username: 'John2' };
      await chatService.handleUserConnectEvent(mockData2);

      const users = (chatService as any).rooms.get('testId');
      expect(users.has('John')).toBe(true);
    });

    it('should throw UserAlreadyConnectedException', async () => {
      await expect(
        chatService.handleUserConnectEvent(mockData),
      ).rejects.toThrow();
    });

    it('should throw UsersLimitPerRoomExceeded', async () => {
      const roomId = 'testRoom';
    
      for (let i = 0; i < 5; i++) {
        await chatService.handleUserConnectEvent({
          roomId,
          username: `User${i}`,
        });
      }
    
      await expect(
        chatService.handleUserConnectEvent({
          roomId,
          username: 'ExtraUser',
        }),
      ).rejects.toThrow(UsersLimitPerRoomExceeded);
    });
  });

  describe('User Disconnection', () => {
    it('should remove user from room', async () => {
      await chatService.handleUserDisconnectEvent(
        mockData.roomId,
        mockData.username,
      );

      const users = (chatService as any).rooms.get(mockData.username);
      expect(users).toBe(undefined);
    });
  });

  describe('User Information Retrieval', () => {
    it('should return list of users in a room', async () => {
      const users = await chatService.getUsers(mockData.roomId);

      expect(users).toMatchObject([mockData.username]);
    });
  });
});