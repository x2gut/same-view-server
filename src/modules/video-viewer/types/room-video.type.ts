export type RoomVideo = {
  permissions?: {
    video: 'host' | 'all';
    playback: 'host' | 'all';
  };
  video: {
    url: string;
    timecode: number;
  };
};
