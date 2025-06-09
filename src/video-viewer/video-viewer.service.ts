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
      roomVideo = { video: { url: 'j', timecode: 0 } };
      this.roomVideo.set(roomId, { video: { url: 'j', timecode: 0 } });
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
}
