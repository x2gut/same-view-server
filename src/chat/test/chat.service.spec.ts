import { Test } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { ChatService } from '../chat.service';

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

  it('should add user to room', async () => {
    const mockData2 = { roomId: 'testId2', username: 'John2' };
    await chatService.handleUserConnectEvent(mockData2);

    const users = (chatService as any).rooms.get('testId');
    expect(users.has('John')).toBe(true);
  });

  it('should throw userAlreadyConnectedException', async () => {
    await expect(
      chatService.handleUserConnectEvent(mockData),
    ).rejects.toThrow();
  });

  it('should remove user from room', async () => {
    await chatService.handleUserDisconnectEvent(
      mockData.roomId,
      mockData.username,
    );

    const users = (chatService as any).rooms.get(mockData.username);
    expect(users).toBe(undefined);
  });

  it('should return list of users in a room', async () => {
    const users = await chatService.getUsers(mockData.roomId);

    expect(users).toMatchObject([mockData.username]);
  });
});
