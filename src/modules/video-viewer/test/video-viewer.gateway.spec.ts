import { Server, Socket } from 'socket.io';
import { VideoViewerService } from '../video-viewer.service';
import { VideoViewerGateway } from '../video-viewer.gateway';
import { VideoViewerEvents } from '../events/video-viewer.events';
import { Test, TestingModule } from '@nestjs/testing';

describe('VideoViewer gateway', () => {
  let serverMock: jest.Mocked<Pick<Server, 'emit' | 'to'>>;
  let clientMock: jest.Mocked<Socket>;
  let videoViewerService: jest.Mocked<VideoViewerService>;
  let gateway: VideoViewerGateway;

  beforeEach(async () => {
    const serviceMock = {
      setVideo: jest.fn(),
      changeRoomVideoTimecode: jest.fn(),
      getVideoByRoomId: jest.fn(),
    };

    serverMock = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      emit: jest.fn(),
    };

    clientMock = {
      id: 'test-client-id',
      join: jest.fn(),
      rooms: new Set<string>(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoViewerGateway,
        {
          provide: VideoViewerService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    gateway = module.get<VideoViewerGateway>(VideoViewerGateway);
    gateway.server = serverMock as any;
    videoViewerService = module.get(VideoViewerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleJoin', () => {
    const mockData = { roomId: 'test-room-id' };

    const mockVideoData = {
      video: {
        url: 'www.youtube.com/watch/test',
        timecode: 60,
      },
    };

    it('should join user to the room and emit data', async () => {
      jest
        .spyOn(videoViewerService, 'getVideoByRoomId')
        .mockResolvedValue(mockVideoData);

      await gateway.handleJoin(clientMock, mockData);

      expect(clientMock.join).toHaveBeenCalledWith(mockData.roomId);
      expect(videoViewerService.getVideoByRoomId).toHaveBeenCalledWith(
        mockData.roomId,
      );
      expect(serverMock.to(mockData.roomId).emit).toHaveBeenCalledWith(
        VideoViewerEvents.ON_USER_JOIN,
        mockVideoData,
      );
    });
  });

  describe('setVideo', () => {
    const mockData = {
      roomId: 'testId',
      videoUrl: 'www.youtube.com/watch/test',
    };

    it('should set or change new url and emit message', async () => {
      await gateway.setVideo(clientMock, mockData);

      expect(clientMock.join).toHaveBeenCalledWith(mockData.roomId);
      expect(videoViewerService.setVideo).toHaveBeenCalledWith(
        mockData.roomId,
        mockData.videoUrl,
      );
      expect(serverMock.to(mockData.roomId).emit).toHaveBeenCalledWith(
        VideoViewerEvents.VIDEO_CHANGED,
        { videoUrl: 'www.youtube.com/watch/test' },
      );
    });
  });

  describe('handle video paused and resume events', () => {
    const mockData = { username: 'test', roomId: 'roomId' };
    const { roomId } = mockData;

    it('should emit pause video message', async () => {
      clientMock.rooms.add(roomId);

      await gateway.pauseVideo(clientMock, mockData);

      expect(serverMock.to(roomId).emit).toHaveBeenCalledWith(
        VideoViewerEvents.VIDEO_PAUSED,
        { username: 'test' },
      );
    });

    it('should emit resume video message', async () => {
      clientMock.rooms.add(roomId);

      await gateway.resumeVideo(clientMock, mockData);

      expect(serverMock.to(roomId).emit).toHaveBeenCalledWith(
        VideoViewerEvents.VIDEO_RESUMED,
        { username: 'test' },
      );
    });
  });

  it('emit seek video', async () => {
    const mockData = { roomId: 'test', username: 'test', seconds: 30 };
    const { roomId, seconds, username } = mockData;

    clientMock.rooms.add(roomId);

    await gateway.seekVideo(clientMock, mockData);

    expect(videoViewerService.changeRoomVideoTimecode).toHaveBeenCalledWith(
      roomId,
      seconds,
    );
    expect(serverMock.to(roomId).emit).toHaveBeenCalledWith(
      VideoViewerEvents.VIDEO_SEEKED,
      { username, seconds },
    );
  });
});
