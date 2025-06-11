import { RoomVideo } from '../types/room-video.type';
import { VideoViewerService } from '../video-viewer.service';

describe('VideoViewerService', () => {
  let service: VideoViewerService;

  beforeEach(() => {
    service = new VideoViewerService();
    service['roomVideo'] = new Map<string, RoomVideo>();
  });

  it('should add video to Map object ', async () => {
    await service.setVideo('testRoomId', 'testVideoUrl');

    const roomVideo = service['roomVideo'].get('testRoomId');
    expect(roomVideo).toEqual({ video: { url: 'testVideoUrl', timecode: 0 } });
  });

  it('should return RoomVideo by roomId', async () => {
    const roomVideo = await service.getVideoByRoomId('testRoomId');

    expect(roomVideo).toMatchObject({
      video: {
        url: expect.any(String),
        timecode: expect.any(Number),
      },
    });
  });

  describe('changeRoomVideoTimecode', () => {
    it('should update video timecode for a valid roomId', async () => {
      service['roomVideo'].set('room123', {
        video: { url: 'video.mp4', timecode: 0 },
      });

      await service.changeRoomVideoTimecode('room123', 120);

      expect(service['roomVideo'].get('room123')?.video.timecode).toBe(120);
    });

    it('should throw an error if roomId is not found', async () => {
      await expect(
        service.changeRoomVideoTimecode('notFoundRoom', 100),
      ).rejects.toThrow('No room found with such id: notFoundRoom');
    });
  });
});
