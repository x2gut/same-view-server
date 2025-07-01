class ChangeRoomPermissionsDto {
  hostName: string;
  roomId: string;
  permissions: {
    video: 'all' | 'host';
    playback: 'all' | 'host';
    reactions: 'enabled' | 'disabled';
  };
}

export default ChangeRoomPermissionsDto;
