export class ChangeUserStatusDto {
  roomId: string;
  user: {
    username: string;
    settings: {
      isDeaf: boolean;
      isMuted: boolean;
    };
  };
}
