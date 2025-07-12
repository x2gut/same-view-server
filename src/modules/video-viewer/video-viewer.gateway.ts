import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { VideoViewerService } from './video-viewer.service';
import { VideoViewerEvents } from './events/video-viewer.events';
import { Server, Socket } from 'socket.io';
import {
  OnUserJoinVideoRoomDto,
  SendReactionDto,
  SetVideoDto,
  VideoPausedDto,
  VideoResumedDto,
  VideoSeekedDto,
} from './dto';
import ChangeRoomPermissionsDto from './dto/change-room-permissions.dto';

@WebSocketGateway({ namespace: '/video' })
export class VideoViewerGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly videoViewerService: VideoViewerService) {}

  //HANDLE USER JOIN EVENT
  @SubscribeMessage(VideoViewerEvents.ON_USER_JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: OnUserJoinVideoRoomDto,
  ) {
    const { roomId } = data;
    client.join(roomId);

    const roomVideo = await this.videoViewerService.getVideoByRoomId(roomId);

    this.server.to(roomId).emit(VideoViewerEvents.ON_USER_JOIN, {
      video: {
        url: roomVideo.video.url,
        timecode: roomVideo.video.timecode,
      },
    });
  }

  //HANDLE VIDEO CHANGE EVENT
  @SubscribeMessage(VideoViewerEvents.SET_VIDEO)
  async setVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SetVideoDto,
  ) {
    const { roomId, videoUrl } = data;

    client.join(roomId);

    await this.videoViewerService.setVideo(roomId, videoUrl);

    this.server.to(roomId).emit(VideoViewerEvents.VIDEO_CHANGED, {
      videoUrl: videoUrl,
    });
  }

  //HANDLE VIDEO PAUSED EVENT
  @SubscribeMessage(VideoViewerEvents.VIDEO_PAUSED)
  async pauseVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoPausedDto,
  ) {
    const { roomId, username } = data;

    if (!client.rooms.has(roomId)) {
      return;
    }

    this.server.to(roomId).emit(VideoViewerEvents.VIDEO_PAUSED, {
      username,
    });
  }

  //HANDLE VIDEO RESUMED EVENT
  @SubscribeMessage(VideoViewerEvents.VIDEO_RESUMED)
  async resumeVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoResumedDto,
  ) {
    const { roomId, username } = data;

    if (!client.rooms.has(roomId)) {
      return;
    }

    this.server.to(roomId).emit(VideoViewerEvents.VIDEO_RESUMED, {
      username,
    });
  }

  // HANDLE CHANGE VIDEO SEEKED EVENT
  @SubscribeMessage(VideoViewerEvents.VIDEO_SEEKED)
  async seekVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoSeekedDto,
  ) {
    const { roomId, seconds, username } = data;

    if (!client.rooms.has(roomId)) {
      return;
    }

    await this.videoViewerService.changeRoomVideoTimecode(roomId, seconds);

    this.server.to(roomId).emit(VideoViewerEvents.VIDEO_SEEKED, {
      username,
      seconds,
    });
  }

  // HANDLE CHANGE VIDEO ROOM PERMISSIONS
  @SubscribeMessage(VideoViewerEvents.CHANGE_ROOM_PERMISSIONS)
  async changeRoomPermissions(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChangeRoomPermissionsDto,
  ) {
    const { hostName, roomId, permissions } = data;

    if (!client.rooms.has(roomId)) {
      return;
    }

    this.videoViewerService.changeRoomVideoPermissions(roomId, permissions);

    this.server.to(roomId).emit(VideoViewerEvents.CHANGE_ROOM_PERMISSIONS, {
      hostName,
      permissions,
    });
  }

  // HANDLE SEND REACTION
  @SubscribeMessage(VideoViewerEvents.NEW_REACTION)
  async sendReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendReactionDto,
  ) {
    const { roomId, emoji } = data;

    if (!client.rooms.has(roomId)) {
      return;
    }

    this.server.to(roomId).emit(VideoViewerEvents.NEW_REACTION, {
      emoji,
    });
  }
}
