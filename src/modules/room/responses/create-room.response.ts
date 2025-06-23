export interface CreateRoomResponse {
  message: string;
  data: {
    roomName: string;
    roomKey: string;
    roomId: string;
    isPrivate: boolean;
    createdAt: Date;
    video?: {
      url: string;
      timecode: string;
    };
  };
}
