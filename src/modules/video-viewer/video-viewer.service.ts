import { Injectable } from '@nestjs/common';
import { RoomVideo } from './types/room-video.type';

@Injectable()
export class VideoViewerService {
  private roomVideo: Map<string, RoomVideo>;

  constructor() {
    this.roomVideo = new Map<string, RoomVideo>();
  }

  async setVideo(roomId: string, videoUrl: string): Promise<void> {
    this.roomVideo.set(roomId, { video: { url: videoUrl, timecode: 0 } });
  }

  async getVideoByRoomId(roomId: string): Promise<RoomVideo> {
    let roomVideo = this.roomVideo.get(roomId);

    if (!roomVideo) {
      roomVideo = {
        video: { url: '', timecode: 0 },
        permissions: { video: 'host', playback: 'all' },
      };
      this.roomVideo.set(roomId, roomVideo);
    }

    return roomVideo;
  }

  async changeRoomVideoTimecode(roomId: string, seconds: number) {
    const roomVideo = this.roomVideo.get(roomId);

    if (!roomVideo) {
      throw new Error(`No room found with such id: ${roomId}`);
    }

    roomVideo.video.timecode = seconds;
  }

  async changeRoomVideoPermissions(
    roomId,
    permission: { video: 'all' | 'host'; playback: 'all' | 'host' },
  ) {
    const roomVideo = this.roomVideo.get(roomId);

    if (!roomVideo) {
      throw new Error(`No room found with such id: ${roomId}`);
    }

    this.roomVideo.set(roomId, { ...roomVideo, permissions: permission });
  }
}
