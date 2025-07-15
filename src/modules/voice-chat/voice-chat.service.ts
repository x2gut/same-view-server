import { Injectable } from '@nestjs/common';
import { VoiceChatUser } from './types/voice-chat-user.type';

@Injectable()
export class VoiceChatService {
  private voiceRooms: Map<string, Map<string, VoiceChatUser>>;

  constructor() {
    this.voiceRooms = new Map<string, Map<string, VoiceChatUser>>();
  }

  private getVoiceChatUser(username: string, roomId: string) {
    return this.voiceRooms.get(roomId)?.get(username);
  }

  async onVoiceChatConnected(roomId: string, username: string, userId: string) {
    let room = this.voiceRooms.get(roomId);

    if (!room) {
      room = new Map<string, VoiceChatUser>();
      this.voiceRooms.set(roomId, room);
    }

    const user = {
      username,
      id: userId,
      settings: { isMuted: false, isDeaf: false },
    };

    room.set(username, user);

    return user;
  }

  onVoiceChatDisconnect(roomId: string, username: string) {
    const room = this.voiceRooms.get(roomId);
    if (!room) return;

    room.delete(username);

    if (room.size === 0) {
      this.voiceRooms.delete(roomId);
    }
  }

  getConnectedUsers(roomId: string): VoiceChatUser[] {
    return Array.from(this.voiceRooms.get(roomId)?.values() || []);
  }

  changeUserStatus(
    roomId: string,
    username: string,
    isDeaf: boolean,
    isMuted: boolean,
  ) {
    const user = this.getVoiceChatUser(username, roomId);
    const room = this.voiceRooms.get(roomId);

    if (!user || !room) return;

    const updatedUser = {
      ...user,
      settings: { isDeaf: isDeaf, isMuted: isMuted },
    };
    room.set(username, updatedUser);

    return updatedUser;
  }
}
