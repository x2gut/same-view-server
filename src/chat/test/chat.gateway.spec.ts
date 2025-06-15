import * as dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from '../chat.gateway';
import { ChatService } from '../chat.service';
import { ChatEvents } from '../events/chat-events.enum';
import { UserAlreadyConnectedException } from '../exceptions/userAlreadyConnected';
import { UsersLimitPerRoomExceeded } from '../exceptions/usersLimitPerRoomExceeded';
import { OnUserJoinDto } from '../dto';
import { Test, TestingModule } from '@nestjs/testing';

dotenv.config({ path: '.env.dev' });

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let serverMock: Pick<Server, 'emit' | 'to'>;
  let chatService: jest.Mocked<ChatService>;
  let clientMock: jest.Mocked<Socket>;

  beforeEach(async () => {
    const chatServiceMock = {
      handleUserConnectEvent: jest.fn(),
      handleUserDisconnectEvent: jest.fn(),
      getUsers: jest.fn().mockResolvedValue(['user1, user2, user3']),
    };

    serverMock = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      emit: jest.fn(),
    };

    clientMock = {
      id: '',
      data: {
        roomId: 'test',
        username: 'test',
      },
      emit: jest.fn(),
      join: jest.fn(),
      rooms: new Set<string>(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: chatServiceMock,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    gateway.server = serverMock as any;
    chatService = module.get(ChatService);
  });

  describe('Test exceptions', () => {
    const { username, roomId }: OnUserJoinDto = {
      username: 'TestUser',
      roomId: 'TestRoomId',
    };

    it('Test UserAlreadyConnectedException', async () => {

      const mockError = new UserAlreadyConnectedException(username, roomId);

      chatService.handleUserConnectEvent.mockRejectedValue(mockError);

      await gateway.handleJoin(clientMock, { username, roomId });

      expect(chatService.handleUserConnectEvent).toHaveBeenCalledWith({
        username,
        roomId,
      });
      expect(
        clientMock.emit(ChatEvents.ERROR, {
          data: mockError.toErrorResponse(),
        }),
      );
      expect(clientMock.join).not.toHaveBeenCalled()
      expect(serverMock.emit).not.toHaveBeenCalled()
    });

    it('Test UsersLimitPerRoomExceeded', async () => {
      const mockError = new UsersLimitPerRoomExceeded(5);

      chatService.handleUserConnectEvent.mockRejectedValue(mockError);

      await gateway.handleJoin(clientMock, { username, roomId });

      expect(chatService.handleUserConnectEvent).toHaveBeenCalledWith({
        username,
        roomId,
      });
      expect(
        clientMock.emit(ChatEvents.ERROR, {
          data: mockError.toErrorResponse(),
        }),
      );
      expect(clientMock.join).not.toHaveBeenCalled()
      expect(serverMock.emit).not.toHaveBeenCalled()
    });
  });

  
  describe('OnUserConnect', () => {
    it('should send message when connected', async () => {
      await gateway.handleJoin(clientMock, {
        username: 'test',
        roomId: 'test',
      });

      const users = await chatService.getUsers('test');

      expect(chatService.handleUserConnectEvent).toHaveBeenCalled();
      expect(serverMock.to('test').emit).toHaveBeenCalledWith(
        ChatEvents.NEW_MESSAGE,
        {
          message: `test has connected to the room.`,
          type: 'system',
          timestamp: expect.any(String),
          users: users,
        },
      );
      expect(clientMock.join).toHaveBeenLastCalledWith('test');
    });
  });

  it('should send new message to users in the room', async () => {
    await gateway.handleMessage({
      message: 'test',
      roomId: 'test',
      username: 'test',
    });

    expect(serverMock.to('test').emit).toHaveBeenCalledWith(
      ChatEvents.NEW_MESSAGE,
      expect.objectContaining({ type: 'user' }),
    );
  });

  it('should disconnect user and send message', async () => {
    await gateway.handleDisconnect(clientMock);

    expect(chatService.handleUserDisconnectEvent).toHaveBeenCalled();
    expect(serverMock.to('test').emit).toHaveBeenCalledWith(
      ChatEvents.NEW_MESSAGE,
      expect.objectContaining({ type: 'system' }),
    );
  });
});
