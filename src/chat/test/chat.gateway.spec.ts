import * as dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from '../chat.gateway';
import { ChatService } from '../chat.service';
import { ChatEvents } from '../events/chat-events.enum';
import { UserAlreadyConnectedException } from '../exceptions/userAlreadyConnected';
import { UsersLimitPerRoomExceeded } from '../exceptions/usersLimitPerRoomExceeded';

dotenv.config({ path: '.env.dev' });

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let serverMock: Pick<Server, 'emit' | 'to'>;
  let chatServiceMock: Partial<ChatService>;
  let clientMock: jest.Mocked<Socket>;

  beforeEach(() => {
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

    chatServiceMock = {
      handleUserConnectEvent: jest.fn(),
      handleUserDisconnectEvent: jest.fn(),
      getUsers: jest.fn().mockResolvedValue(['test']),
    };

    gateway = new ChatGateway(chatServiceMock as any);
    (gateway.server as any) = serverMock as Server;
  });

  describe('Test exceptions', () => {
    it('Test UserAlreadyConnectedException', async () => {
      const exception = new UserAlreadyConnectedException(
        'testUser',
        'testRoom',
      );

      const response = exception.toErrorResponse();

      expect(response).toEqual({
        errorType: 'UserAlreadyConnected',
        message: `User testUser is already connected to the room`,
      });
    });

    it('Test UsersLimitPerRoomExceeded', async () => {
      const exception = new UsersLimitPerRoomExceeded(5);

      const response = exception.toErrorResponse();

      expect(response).toEqual({
        errorType: 'UsersLimitPerRoomExceeded',
        message: 'Room already has 5 online members',
      });
    });
  });

  describe('OnUserConnect', () => {
    it('should send message when connected', async () => {
      await gateway.handleJoin(clientMock, {
        username: 'test',
        roomId: 'test',
      });

      expect(chatServiceMock.handleUserConnectEvent).toHaveBeenCalled();
      expect(serverMock.to('test').emit).toHaveBeenCalledWith(
        ChatEvents.NEW_MESSAGE,
        {
          message: `test has connected to the room.`,
          type: 'system',
          timestamp: expect.any(String),
          users: ['test'],
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

    expect(chatServiceMock.handleUserDisconnectEvent).toHaveBeenCalled();
    expect(serverMock.to('test').emit).toHaveBeenCalledWith(
      ChatEvents.NEW_MESSAGE,
      expect.objectContaining({ type: 'system' }),
    );
  });
});
