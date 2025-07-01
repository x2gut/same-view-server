export type RoomVideo = {
  permissions?: {
    video: 'host' | 'all';
    playback: 'host' | 'all';
    reactions: 'enabled' | 'disabled';
  };
  video: {
    url: string;
    timecode: number;
  };
};
