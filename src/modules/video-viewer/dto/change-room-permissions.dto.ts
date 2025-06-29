class ChangeRoomPermissionsDto {
  hostName: string;
  roomId: string;
  permissions: {
    video: 'all' | 'host';
    playback: 'all' | 'host';
  };
}

export default ChangeRoomPermissionsDto;
