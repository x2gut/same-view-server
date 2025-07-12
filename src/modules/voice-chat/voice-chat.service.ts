import { Injectable } from "@nestjs/common";
import { VoiceChatUser } from "./types/voice-chat-user.type";

@Injectable()
export class VoiceChatService {
  private voiceRooms: Map<string, Map<string, VoiceChatUser>>;

  constructor() {
    this.voiceRooms = new Map<string, Map<string, VoiceChatUser>>();
  }

  async onVoiceChatConnected(roomId: string, username: string, userId: string) {
    let room = this.voiceRooms.get(roomId);

    if (!room) {
      room = new Map<string, VoiceChatUser>();
      this.voiceRooms.set(roomId, room);
    }

    room.set(username, { username, isDeaf: false, isMuted: false, id: userId });

    console.log(this.voiceRooms);
  }

  async onVoiceChatDisconnect(roomId: string, username: string) {
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
}
