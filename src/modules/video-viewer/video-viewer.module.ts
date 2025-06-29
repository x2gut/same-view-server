import { Module } from '@nestjs/common';
import { VideoViewerService } from './video-viewer.service';
import { VideoViewerGateway } from './video-viewer.gateway';

@Module({
  providers: [VideoViewerGateway, VideoViewerService],
})
export class VideoViewerModule {}
