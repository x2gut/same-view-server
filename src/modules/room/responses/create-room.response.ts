export interface CreateRoomResponse {
  message: string;
  data: {
    roomName: string;
    roomKey: string;
    roomId: string;
    isPrivate: boolean;
    createdAt: Date;
    isOwner: boolean;
    video?: {
      url: string;
      timecode: string;
    };
  };
}
