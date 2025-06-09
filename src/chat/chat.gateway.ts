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
import { UserAlreadyConnectedException } from './exceptions/userAlreadyConnected';
import { OnUserJoinDto, SendMessageDto } from './dto';
import { WsEvents } from './events/ws-messages.events';

@WebSocketGateway(80, {namespace: "/chat"})
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  private emitEvent<K extends keyof WsEvents>(
    event: K,
    payload: WsEvents[K],
    to?: string,
  ) {
    const wsEvent = this.server;

    if (to) {
      return wsEvent.to(to).emit(event, payload);
    }

    wsEvent.emit(event, payload);
  }

  @SubscribeMessage(ChatEvents.ON_USER_JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: OnUserJoinDto,
  ) {
    const { username, roomId } = data;

    try {
      await this.chatService.handleUserConnectEvent(data);

      client.data.username = username;
      client.data.roomId = roomId;

      client.join(roomId);

      this.emitEvent(
        ChatEvents.NEW_MESSAGE,
        {
          message: `${username} has connected to the room.`,
          type: 'system',
          timestamp: new Date().toISOString(),
          users: (await this.chatService.getUsers(roomId)) || [],
        },
        roomId,
      );
    } catch (error) {
      if (error instanceof UserAlreadyConnectedException) {
        throw error;
      }
      throw error;
    }
  }

  @SubscribeMessage(ChatEvents.NEW_MESSAGE)
  async handleMessage(@MessageBody() data: SendMessageDto) {
    this.emitEvent(
      ChatEvents.NEW_MESSAGE,
      {
        username: data.username,
        message: data.message,
        type: 'user',
        timestamp: new Date().toISOString(),
      },
      data.roomId,
    );
  }

  async handleDisconnect(client: any) {
    const { roomId, username } = client.data;

    if (!roomId || !username) {
      return;
    }

    await this.chatService.handleUserDisconnectEvent(roomId, username);

    this.emitEvent(
      ChatEvents.NEW_MESSAGE,
      {
        message: `${username} has left the room`,
        type: 'system',
        timestamp: new Date().toISOString(),
        users: (await this.chatService.getUsers(roomId)) || [],
      },
      roomId,
    );
  }
}
