import { Injectable } from '@nestjs/common';
import { UserAlreadyConnectedException } from './exceptions/userAlreadyConnected';
import { OnUserJoinDto } from './dto/on-user-join.dto';
import { UsersLimitPerRoomExceeded } from './exceptions/usersLimitPerRoomExceeded';

@Injectable()
export class ChatService {
  private rooms: Map<string, Set<string>>;
  private usersLimitPerRoom: number;

  constructor() {
    this.rooms = new Map<string, Set<string>>();
    this.usersLimitPerRoom = 5;
  }

  async handleUserConnectEvent(data: OnUserJoinDto): Promise<void> {
    const { username, roomId } = data;
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set<string>());
    }

    const connectedUsers = this.rooms.get(roomId) || new Set<string>();

    if (connectedUsers.has(username)) {
      throw new UserAlreadyConnectedException(username, roomId);
    }

    if (connectedUsers.size >= this.usersLimitPerRoom) {
      throw new UsersLimitPerRoomExceeded(this.usersLimitPerRoom);
    }

    connectedUsers.add(username);
  }

  async handleUserDisconnectEvent(roomId: string, username: string) {
    const currentRoom = this.rooms.get(roomId);

    if (!currentRoom) {
      return;
    }

    currentRoom.delete(username);

    if (currentRoom.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  async getUsers(roomId: string) {
    const users = this.rooms.get(roomId);

    if (!users) {
      return;
    }

    return Array.from(users);
  }
}
