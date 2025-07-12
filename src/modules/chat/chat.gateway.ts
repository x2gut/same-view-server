import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatEvents } from './events/chat-events.enum';
import { OnUserJoinDto, SendMessageDto, UserWritingDto } from './dto';
import { BaseException } from './exceptions/baseException';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage(ChatEvents.ON_USER_JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: OnUserJoinDto,
  ) {
    const { username, roomId } = data;

    try {
      await this.chatService.handleUserConnectEvent(data);
    } catch (error) {
      if (error instanceof BaseException) {
        client.emit(ChatEvents.ERROR, {
          data: error.toErrorResponse(),
        });
        return;
      }
    }

    client.data.username = username;
    client.data.roomId = roomId;

    client.join(roomId);

    this.server.to(roomId).emit(ChatEvents.NEW_MESSAGE, {
      message: `${username} has connected to the room.`,
      type: 'system',
      timestamp: new Date().toISOString(),
      users: (await this.chatService.getUsers(roomId)) || [],
    });
  }

  @SubscribeMessage(ChatEvents.NEW_MESSAGE)
  async handleMessage(@MessageBody() data: SendMessageDto) {
    this.server.to(data.roomId).emit(ChatEvents.NEW_MESSAGE, {
      username: data.username,
      message: data.message,
      type: 'user',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage(ChatEvents.USER_IS_TYPING)
  async handleUserWriting(
    @ConnectedSocket() client,
    @MessageBody() data: UserWritingDto,
  ) {
    const { username, roomId } = data;
    client.to(roomId).emit(ChatEvents.USER_IS_TYPING, {
      username: username,
    });
  }

  async handleDisconnect(client: Socket) {
    const { roomId, username } = client.data;

    if (!roomId || !username) {
      return;
    }

    await this.chatService.handleUserDisconnectEvent(roomId, username);

    this.server.to(roomId).emit(ChatEvents.NEW_MESSAGE, {
      message: `${username} has left the room`,
      type: 'system',
      timestamp: new Date().toISOString(),
      users: (await this.chatService.getUsers(roomId)) || [],
    });
  }
}
