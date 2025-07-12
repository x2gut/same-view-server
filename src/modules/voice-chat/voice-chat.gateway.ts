import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { VoiceChatService } from './voice-chat.service';
import { SignalPayload } from './types/signal-data.type';
import { VoiceChatEvents } from './events/voice-chat.events';
import { VoiceChatJoinDto } from './dto/voice-chat-join.dto';
import { GetVoiceChatUsers } from './dto/get-voice-chat-users.dto';

@WebSocketGateway({ namespace: '/voice' })
export class VoiceChatGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly voiceChatService: VoiceChatService) {}

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    const { username, roomId } = client.data;

    if (!username || !roomId) {
      return;
    }

    await this.voiceChatService.onVoiceChatDisconnect(roomId, username);

    this.server.to(roomId).emit(VoiceChatEvents.USER_LEFT, {
      username,
    });
  }

  @SubscribeMessage(VoiceChatEvents.GET_USERS)
  async getVoiceChatUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GetVoiceChatUsers,
  ) {
    if (!client.rooms.has(data.roomId)) {
      client.join(data.roomId);
    }

    const users = this.voiceChatService.getConnectedUsers(data.roomId);

    this.server.to(data.roomId).emit(VoiceChatEvents.GET_USERS, {
      users: users,
    });
  }

  @SubscribeMessage(VoiceChatEvents.USER_LEFT)
  async handleUserDisconnect(client: Socket): Promise<void> {
    await this.handleDisconnect(client);
  }

  @SubscribeMessage(VoiceChatEvents.USER_JOINED)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VoiceChatJoinDto,
  ): Promise<void> {
    if (!data.roomId || !data.username) {
      return;
    }

    client.join(data.roomId);

    client.data.username = data.username;
    client.data.roomId = data.roomId;

    await this.voiceChatService.onVoiceChatConnected(
      data.roomId,
      data.username,
      client.id,
    );

    this.server.to(data.roomId).emit(VoiceChatEvents.USER_JOINED, {
      username: data.username,
      id: client.id,
    });
  }

  @SubscribeMessage(VoiceChatEvents.SIGNAL)
  async handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SignalPayload,
  ): Promise<void> {
    if (!payload.target || !payload.data) {
      return;
    }

    console.log(
      payload.type
    )

    this.server.to(payload.target).emit(VoiceChatEvents.SIGNAL, {
      from: client.id,
      data: payload.data,
      type: payload.type,
    });
  }
}
